import { hasUserWithEmail, createUser, getUserByEmail } from '../repository/auth-repository';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

// Constant-time comparison to prevent timing attacks
const constantTimeCompare = async (inputPassword: string, storedHash: string | null): Promise<boolean> => {
    // Always compare (even with dummy hash for non-existent users)
    const dummyHash = '$2b$10$dummyhashforsecuritytiming00000000';
    const hashToCompare = storedHash || dummyHash;
    return await bcrypt.compare(inputPassword, hashToCompare);
};

const setCookie = (res: Response, name: string, value: string): void => {
    res.cookie(name, value, {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'strict',
            maxAge : process.env.JWT_COOKIE_EXPIRY ? parseInt(process.env.JWT_COOKIE_EXPIRY) * 1000 : 15 * 60 * 1000 // default 15 minutes
        });
}

interface UserPayload {
    sub: number;
    email: string;
    firstName: string;
    lastName: string | null;
}

interface UserData {
    id: number;
    email: string;
    firstName: string;
    lastName: string | null;
}

function generateAccessToken(user: UserData): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured');
    }
    
    const payload: UserPayload = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
    };
    
    const options: any = { 
        expiresIn: process.env.JWT_EXPIRY || '15m', 
        issuer: 'invoice-billing-system' 
    };
    
    return jsonwebtoken.sign(payload, secret, options);
}

async function LoginUser(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    
    if (!email || !password) { 
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
        const user = await getUserByEmail(normalizedEmail);
        
        // Constant-time comparison (even for non-existent users)
        const storedHash = user?.password || null;
        const passwordMatch = await constantTimeCompare(password, storedHash);
        
        // Validate user exists AND password matches
        if (!user || !passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        // Check if user is active (add this field to your User model)
        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }
        
        const accessToken = generateAccessToken(user);

        setCookie(res, 'accessToken', accessToken);
        
        return res.status(200).json({ 
            message: 'Login successful'
        });
        
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function RegisterUser(req: Request, res: Response): Promise<Response> {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate all required fields
    if (!email || !password || !firstName) {
        return res.status(400).json({ 
            message: 'Missing required fields: email, password, and firstName are required' 
        });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long' 
        });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
        // Check if user exists
        const userExists = await hasUserWithEmail(normalizedEmail);
        if (userExists) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create user with additional default fields
        const userData = {
            firstName: firstName.trim(),
            lastName: lastName?.trim() || null,
            email: normalizedEmail,
            password: hashedPassword
        };
        
        const newUser = await createUser(userData);
        
        // Generate token with user ID
        const accessToken = generateAccessToken(newUser);
        
        setCookie(res, 'accessToken', accessToken);
        
        return res.status(201).json({ 
            message: 'User registered successfully'
        });
        
    } catch (err) {
        console.error('Registration error:', err);
        
        // Handle specific Prisma errors
        const prismaError = err as any;
        if (prismaError?.code === 'P2002') {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        return res.status(500).json({ message: 'Internal server error' });
    }
}
export { RegisterUser, LoginUser };
