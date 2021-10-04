import React from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

const Docs = () => {
  return <SwaggerUI url={`${process.env.NEXT_PUBLIC_API_URL}/docs`} />
}

export default Docs
