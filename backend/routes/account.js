// backend/routes/account.js
const express = require('express');
const bcrypt = require("bcryptjs");
const { authMiddleware } = require('../middleware');
const { User,Account,Transaction } = require('../db');
const { default: mongoose } = require('mongoose');


const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });
    const user = await User.findById(req.userId).select("firstName");

    res.json({
        balance: account.balance,
        userId:req.userId
        
    })
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount, to } = req.body;

        // Fetch the accounts within the transaction
        const account = await Account.findOne({ userId: req.userId }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid account"
            });
        }

        // Perform the transfer
        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        // Save the transaction history for both accounts
        const transaction = new Transaction({
            userId: req.userId,
            amount: -amount,
            status: 'successful',
            date: new Date()
        });

        const toTransaction = new Transaction({
            userId: to,
            amount: +amount,
            status: 'successful',
            date: new Date()
        });

        await transaction.save({ session });
        await toTransaction.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.json({
            message: "Transfer successful"
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Transfer failed", error });
    }
});

router.get('/history/:userId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.userId });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction history', error });
    }
});


module.exports = router;