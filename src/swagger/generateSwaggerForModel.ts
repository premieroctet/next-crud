import { TSwaggerConfig, TSwaggerType, RouteType } from '../types'

interface IGenerateSwaggerForModelParams {
  tag: TSwaggerConfig['tag']
  routes: TSwaggerConfig['routeTypes']
  type: TSwaggerConfig['type']
  queryParams: TSwaggerType[]
  enabledRoutes: RouteType[]
  resourceName: string
}

const generateSwaggerForModel = ({
  tag,
  routes,
  queryParams,
  type,
  enabledRoutes,
  resourceName,
}: IGenerateSwaggerForModelParams) => {
  const tags = [tag.name]

  const tagData = {
    name: tag.name,
    description: tag.description,
    externalDocs: tag.externalDocs,
  }

  const paths: Record<string, any> = {}
}

export default generateSwaggerForModel
