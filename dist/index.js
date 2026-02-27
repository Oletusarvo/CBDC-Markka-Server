"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_router_1 = require("./src/features/auth/auth-router");
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const transactions_router_1 = require("./src/features/transactions/transactions-router");
const accounts_router_1 = require("./src/features/accounts/accounts-router");
const currencies_router_1 = require("./src/features/currencies/currencies-router");
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://10.215.98.92:5173',
    'http://localhost:5173',
    'http://localhost:61032',
    'https://localhost',
    'capacitor://localhost',
    'https://cbdc-markka.onrender.com',
];
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, origin || true);
        }
        else {
            console.log('Disallowed origin', origin);
            return callback(new Error(`Origin ${origin} blocked by CORS!`));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use('/api/auth', auth_router_1.authRouter);
app.use('/api/transactions', transactions_router_1.transactionsRouter);
app.use('/api/accounts', accounts_router_1.accountsRouter);
app.use('/api/currencies', currencies_router_1.currenciesRouter);
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server listening on port ', PORT);
});
