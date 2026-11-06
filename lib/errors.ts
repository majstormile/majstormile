/** An error whose message is safe to show to the person, with the HTTP status to answer with. */
export class AppError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status}}
