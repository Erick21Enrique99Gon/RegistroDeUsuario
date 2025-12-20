import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch(Error)
export class AppErrorRestFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: Error, host: ArgumentsHost) {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const name = exception.name;

        switch (name) {
            case 'InvalidRequestError':
                httpAdapter.reply(
                    ctx.getResponse(),
                    {
                        statusCode: 400,
                        message: exception.message,
                    },
                    400,
                );
                break;
            case 'NotFoundError':
                httpAdapter.reply(
                    ctx.getResponse(),
                    {
                        statusCode: 404,
                        message: exception.message,
                    },
                    404,
                );
                break;
        }
    }
}