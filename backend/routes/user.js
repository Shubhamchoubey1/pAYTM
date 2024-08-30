// backend/routes/user.js
const express = require('express');
const bcrypt = require("bcryptjs");
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const  { authMiddleware } = require("../middleware");

const signupBody = zod.object({
    username: zod.string().email(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})

router.post("/signup", async (req, res) => {
    const { success } = signupBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = await User.create({
        username: req.body.username,
        password: hashedPassword,  // Use the hashed password here
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });

    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
})


const signinBody = zod.object({
    username: zod.string().email(),
	password: zod.string()
})

// backend/routes/user.js

router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body);
    
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        });
    }

    const user = await User.findOne({ username: req.body.username });

    if (user) {
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        
        if (isMatch) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET);

            return res.json({
                token: token,
                firstName: user.firstName // Send firstName along with the token
            });
        }
    }

    res.status(411).json({
        message: "Error while logging in"
    });
});


const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        id: req.userId
    })

    res.json({
        message: "Updated successfully"
    })
})

router.get("/bulk",authMiddleware, async (req, res) => {
    const filter = req.query.filter || "";
    const id = req.userId

    const users = await User.find({
        $and: [{
            $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }
            }]
        }, {
            $nor: [{
                _id: id
            }]
        }]
    });
    

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
router.post("/validate-password",authMiddleware,async (req,res)=>{
    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(req.body.password, user.password);
        
    if (isMatch) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);

        return res.json({
            success:true
        });
    }
    res.status(411).json({
        success:false
    });
})

module.exports = router;