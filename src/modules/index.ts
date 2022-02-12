import { FastifyRequest, FastifyReply } from 'fastify';

export interface Request extends FastifyRequest {
    cookies: { [key: string]: string }
}

export interface Response extends FastifyReply{
    setCookie(name, value, options?),
    clearCookie(name, options)
}
