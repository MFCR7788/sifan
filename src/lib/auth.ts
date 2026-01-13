import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function generateToken(payload: { userId: string }): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
	try {
		return jwt.verify(token, JWT_SECRET) as { userId: string };
	} catch (error) {
		return null;
	}
}
