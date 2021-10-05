import React from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

const Docs = () => {
  return <SwaggerUI url={`${window.location.origin}/api/docs`} />
}

export default Docs
