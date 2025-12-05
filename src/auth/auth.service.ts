import { Injectable, Inject, InternalServerErrorException, ConflictException, UnauthorizedException, HttpException } from '@nestjs/common';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthResponse } from 'src/types/auth-res.type';


@Injectable()
export class AuthService {
    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async getUserFromToken(token: string): Promise<User | null> {
        try {
            const {data, error} = await this.supabase.auth.getUser(token);
            return data.user as User;
        } catch {
            return null;
        }
    }
    
    async signUp(signUpDto:SignUpDto):Promise<AuthResponse> {
        const {email,password,first_name,last_name,phone,role} = signUpDto
        try {
            const {data, error} = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name,
                        last_name,
                        phone,
                        role: role || 'user'
                    },
                },
            });     

            if (error) {
                if (error.status === 409 && error.message.includes('already registered')) {
                    throw new ConflictException('Email is already registered');
                }

                throw new InternalServerErrorException(`Sign up failed: ${error.message}`);
            }

            // Since we have auto - confirmed users, Supabase will return a session with tokens in both sign - up and sign -in.
            const authResponse: AuthResponse = {
                user: {
                    id: data.user.id,
                    email: data.user.email!,
                    firstName: data.user.user_metadata?.first_name || first_name,
                    lastName: data.user.user_metadata?.last_name || last_name,
                    phone: data.user.user_metadata?.phone || phone,
                    role: data.user.user_metadata?.role || role || 'user',
                },
            };
            return authResponse
        } catch (error) {
            if(error instanceof ConflictException)throw error
            else if(error instanceof HttpException)throw error
            throw new InternalServerErrorException(`Unexpected error during sign up:${error.message}`);
        }
    }

    async signIn(signInDto: SignInDto):Promise<AuthResponse> {
        const { email, password } = signInDto
        try {
            const {data, error} = await this.supabase.auth.signInWithPassword({ email, password });
            if (error) {
                if (error.status === 400 || error.status === 401) {
                    throw new UnauthorizedException('Invalid email or password');
                }
                throw new InternalServerErrorException(`Sign in failed: ${error.message}`);
            }

            const authResponse: AuthResponse = {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: {
                    id: data.user.id,
                    email: data.user.email!,
                    firstName: data.user.user_metadata?.first_name || '',
                    lastName: data.user.user_metadata?.last_name || '',
                    phone: data.user.user_metadata?.phone || '',
                    role: data.user.user_metadata?.role || 'user',
                },
            };

            return authResponse 
        } catch (error) {            
            if(error instanceof UnauthorizedException)throw error
            else if (error instanceof HttpException) throw error
            throw new InternalServerErrorException(`Unexpected error during sign in: ${error.message}`);
        }
    }
}
