
interface GetTicketParams {
  customerId: string
  ticketId: string
}

export const GetTicket = async (params: GetTicketParams): Promise<any> => {
  return {...params}
}
