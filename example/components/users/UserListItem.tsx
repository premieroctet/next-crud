import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { ButtonGroup, Flex, HStack, IconButton, Text } from '@chakra-ui/react'
import { User } from '@prisma/client'
import React from 'react'

interface IProps extends User {
  onEdit: (id: User['id']) => void
  onDelete: (id: User['id']) => void
}

const UserListItem = ({ id, username, onEdit, onDelete }: IProps) => {
  return (
    <Flex
      direction="row"
      align="center"
      justify="space-between"
      py={2}
      width="100%"
    >
      <HStack spacing={8} align="center">
        <Text>#{id}</Text>
        <Text>{username}</Text>
      </HStack>
      <ButtonGroup spacing={2}>
        <IconButton
          aria-label="Edit"
          icon={<EditIcon color="white" />}
          colorScheme="blue"
          onClick={() => onEdit(id)}
          size="sm"
        />
        <IconButton
          aria-label="Delete"
          icon={<DeleteIcon color="white" />}
          colorScheme="red"
          onClick={() => onDelete(id)}
          size="sm"
        />
      </ButtonGroup>
    </Flex>
  )
}

export default UserListItem
