import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly role: string) { }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        const user = req.user as any;

        const userRole = user?.user_metadata?.role;

        if (!userRole || userRole !== this.role) {
            throw new ForbiddenException('You are not authorized for this action!');
        }

        return true;
    }
}
