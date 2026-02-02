import jsonwebtoken from 'jsonwebtoken';

function authenticateUser(req, res, next) {
    const token = req.cookies.accessToken; 

    if (!token) {
        return res.status(401).json({ 
            message: 'Unauthorized: Session expired or not found' 
        });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET is not defined');
        const decoded = jsonwebtoken.verify(token, secret);
        req.user = decoded;

        next();
    } catch (err) {
        res.clearCookie('accessToken'); 
        
        return res.status(403).json({ 
            message: 'Forbidden: Invalid or expired session' 
        });
    }
}

export default authenticateUser;