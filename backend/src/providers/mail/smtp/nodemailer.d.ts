declare module 'nodemailer' {
  export type SmtpTransportOptions = {
    readonly host: string;
    readonly port: number;
    readonly secure: boolean;
    readonly auth?: {
      readonly user: string;
      readonly pass: string;
    };
  };

  export type SendMailOptions = {
    readonly from: string;
    readonly to: string;
    readonly subject: string;
    readonly text: string;
    readonly html?: string;
  };

  export type Transporter = {
    sendMail(mailOptions: SendMailOptions): Promise<unknown>;
  };

  export function createTransport(options: SmtpTransportOptions): Transporter;

  const nodemailer: {
    createTransport: typeof createTransport;
  };

  export default nodemailer;
}
