// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client'
import { JSONSchema6 } from 'json-schema'
import { transformDMMF } from 'prisma-json-schema-generator/dist/generator/transformDMMF'
import { getJSONSchemaProperty } from 'prisma-json-schema-generator/dist/generator/properties'
import { formatSchemaRef } from '../../swagger/utils'

function getJSONSchemaScalar(fieldType) {
  switch (fieldType) {
    case 'Int':
    case 'BigInt':
      return 'integer'
    case 'DateTime':
    case 'Bytes':
    case 'String':
      return 'string'
    case 'Float':
    case 'Decimal':
      return 'number'
    case 'Json':
      return 'object'
    case 'Boolean':
      return 'boolean'
    case 'Null':
      return 'null'
  }
}

const PAGINATION_SCHEMA_NAME = 'PaginationData'

const methodsNames = [
  { methodStart: 'createOne', schemaNameStart: 'Create' },
  { methodStart: 'updateOne', schemaNameStart: 'Update' },
]

class PrismaJsonSchemaParser {
  schemaInputTypes: Map<string, JSONSchema6> = new Map<string, JSONSchema6>()

  constructor(
    private prismaClient: PrismaClient,
    private dmmf: Prisma.DMMF.Document
  ) {}

  parseModels() {
    const modelsDefintions = transformDMMF(this.dmmf).definitions

    for (const definition in modelsDefintions) {
      const properties = modelsDefintions[definition].properties

      for (const property in properties) {
        if (
          Array.isArray(properties[property].type) &&
          properties[property].type.includes('null')
        ) {
          properties[property].type = properties[property].type.filter(
            (type) => type !== 'null'
          )

          if (properties[property].type.length === 1) {
            properties[property].type = properties[property].type[0]
          }
          properties[property].nullable = true
        }
      }
    }

    return modelsDefintions
  }

  parseInputTypes(models: string[]) {
    const definitions = models.reduce((acc, modelName) => {
      const methods = methodsNames.map((method) => ({
        name: `${method.methodStart}${modelName}`,
        schemaName: `${method.schemaNameStart}${modelName}`,
      }))

      methods.forEach(({ schemaName }) => {
        const dataFields = this.dmmf.datamodel.models.find(
          (model) => model.name === modelName
        ).fields
        const requiredProperties: string[] = []
        const properties = dataFields.reduce((propertiesAcc, field) => {
          // We don't want to create passing an id field
          if (field.isId) {
            return propertiesAcc
          }

          // We don't want to create or update a readonly field
          if (field.isReadOnly) {
            return propertiesAcc
          }

          if (field.kind === 'scalar') {
            const schema = getJSONSchemaProperty(this.dmmf.datamodel, {})(field)

            if (schema[1].type && Array.isArray(schema[1].type)) {
              if (schema[1].type.includes('null')) {
                propertiesAcc[field.name] = {
                  ...schema[1],
                  type: schema[1].type.filter((type) => type !== 'null'),
                  nullable: true,
                }
                if (propertiesAcc[field.name].type.length === 1) {
                  propertiesAcc[field.name] = {
                    ...propertiesAcc[field.name],
                    type: propertiesAcc[field.name].type[0],
                  }
                }
              }
            } else {
              propertiesAcc[field.name] = schema[1]
            }
          }

          if (field.isRequired) {
            requiredProperties.push(field.name)
          }

          return propertiesAcc
        }, {})

        acc[schemaName] = {
          type: 'object',
          properties,
        }

        if (requiredProperties.length) {
          acc[schemaName].required = requiredProperties
        }
      })

      return acc
    }, {})

    for (const [key, value] of this.schemaInputTypes.entries()) {
      definitions[key] = {
        type: 'object',
        properties: value,
      }
    }

    return definitions
  }

  formatInputTypeData(inputType: Prisma.DMMF.Field) {
    if (inputType.kind === 'object') {
      const ref = formatSchemaRef(inputType.type)
      if (inputType.isList) {
        return {
          type: 'array',
          items: {
            $ref: ref,
          },
        }
      }

      return { $ref: ref }
    } else {
      const type = getJSONSchemaScalar(inputType.type)
      if (inputType.isList) {
        return {
          type: 'array',
          items: {
            type,
          },
        }
      }
      return { type }
    }
  }

  parseObjectInputType(fieldType: Prisma.DMMF.Field) {
    if (fieldType.kind === 'object') {
      if (!this.schemaInputTypes.has(fieldType.type)) {
        this.schemaInputTypes.set(fieldType.type, {})

        const dmmfModel = this.dmmf.datamodel.models.find(
          (model) => model.name === fieldType.type
        )

        dmmfModel.fields.forEach((field) => {
          const fieldData: Record<string, JSONSchema6> = {}
          let nullable = false

          const inputTypeData = this.formatInputTypeData(field)
          if (inputTypeData.type === 'null') {
            nullable = true
          }

          if (nullable) {
            // Nullable is specific to OpenAPI
            // @ts-expect-error
            fieldData.nullable = true
          }

          this.schemaInputTypes.set(fieldType.type, {
            ...this.schemaInputTypes.get(fieldType.type),
            [field.name]: fieldData,
          })

          if (field.kind === 'object') {
            this.parseObjectInputType(field)
          }
        })
      }
      return { $ref: formatSchemaRef(fieldType.type) }
    }

    return { type: getJSONSchemaScalar(fieldType.type) }
  }

  getPaginationDataSchema() {
    return {
      [PAGINATION_SCHEMA_NAME]: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
            minimum: 0,
            description: 'Total number of elements in the collection',
          },
          pageCount: {
            type: 'integer',
            minimum: 0,
            description: 'Total number of pages',
          },
          page: {
            type: 'integer',
            minimum: 0,
            description: 'Current page number',
          },
        },
      },
    }
  }

  getPaginatedModelsSchemas(modelNames: string[]) {
    return modelNames.reduce((acc, modelName) => {
      return {
        ...acc,
        [`${modelName}Page`]: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                $ref: formatSchemaRef(modelName),
              },
            },
            pagination: {
              $ref: formatSchemaRef(PAGINATION_SCHEMA_NAME),
            },
          },
        },
      }
    }, {})
  }
}

export default PrismaJsonSchemaParser
