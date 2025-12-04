import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthResponse } from '@supabase/supabase-js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    @ApiOperation({ summary: 'signup user' })
    async signUp(@Body() signUpDto: SignUpDto):Promise<AuthResponse> {
        return this.authService.signUp(signUpDto);
    }

    @Post('signin')
    @ApiOperation({ summary: 'signin user' })
    async signIn(@Body() signInDto: SignInDto):Promise<AuthResponse> {
        return this.authService.signIn(signInDto);
    }

    // @Post('signout')
    // signOut(@Headers('Authorization') authHeader: string) {
    //     const token = authHeader?.replace('Bearer ', '');
    //     return this.authService.signOut(token);
    // }

    // @Get('me')
    // getProfile(@Headers('Authorization') authHeader: string) {
    //     const token = authHeader?.replace('Bearer ', '');
    //     return this.authService.getProfile(token);
    // }
}
