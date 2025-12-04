import { Injectable, Inject, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { AuthResponse, SupabaseClient, User } from '@supabase/supabase-js';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async getUserFromToken(token: string) {
        const { data, error } = await this.supabase.auth.getUser(token);
        if (error || !data.user) return null;
        return data.user;
    }
    
    async signUp(signUpDto:SignUpDto):Promise<AuthResponse> {
        const {email,password,first_name,last_name,phone} = signUpDto
        try {
            const user = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        firstName: first_name,
                        lastName: last_name,
                        phone: phone,
                    },
                },
            });     
            console.log(user);
                
            return user
        } catch (error) {
            throw new InternalServerErrorException('Failed to sign up');
        }
    }
    //    if (error) {
    //     let message = 'Failed to sign up';
    //     if (error.message.includes('already registered')) {
    //         message = 'This email is already in use';
    //     } else if (error.message.includes('Password')) {
    //         message = 'Password does not meet requirements';
    //     }
    //     throw new BadRequestException(message);
    // }

    // if (!data.user) {
    //     throw new BadRequestException('User could not be created');
    // }

    async signIn(signInDto: SignInDto):Promise<AuthResponse> {
        const { email, password } = signInDto
        try {
            const user = await this.supabase.auth.signInWithPassword({ email, password });
            // if (error) throw new UnauthorizedException(error.message);
            // if (!data.session) throw new UnauthorizedException('Invalid credentials');
            // if (error) {
            //     let message = 'Login failed';
            //     if (error.message.includes('Invalid login credentials')) {
            //         message = 'Invalid email or password';
            //     }
            //     throw new UnauthorizedException(message);
            // }

            // if (!data.session || !data.user) {
            //     throw new UnauthorizedException('Invalid email or password');
            // }

            return user;
        } catch (error) {
            throw new InternalServerErrorException('SignIn failed');
        }
    }

    // async getUser(token: string) {
    //     try {
    //         const { data, error } = await this.supabase.auth.getUser(token);
    //         if (error || !data.user) throw new UnauthorizedException('Invalid token');
    //         return data.user;
    //     } catch (err) {
    //         throw new UnauthorizedException('Could not get user');
    //     }
    // }
}
