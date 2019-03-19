import bunyan from "bunyan"
import { ListTicketsByCustomer, GetTicket } from "./services/tickets";

const logger = bunyan.createLogger({
  name: "appsync",
})

interface HandlerEvent {
  identity: any
  arguments: any
  field: string
}

export const handler = (event: HandlerEvent) => {

  logger.info(event)

  switch (event.field) {
    case "getTicket":
      return GetTicket(event.arguments)
    case "listTicketByCustomer":
      return ListTicketsByCustomer(event.arguments)
    case "saveTicket":
      return event
    default:
      return Promise.reject(`unknown operation: ${event.field}`)
  }
}

