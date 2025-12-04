import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw new UnauthorizedException('No authorization header');

        const token = authHeader.replace('Bearer ', '');
        const user = await this.authService.getUserFromToken(token);
        if (!user) throw new UnauthorizedException('Invalid token');

        req.user = user;
        return true;
    }
}
