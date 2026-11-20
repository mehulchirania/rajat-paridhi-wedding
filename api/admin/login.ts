import { login } from '../_lib/auth.js';

export async function POST(req: Request): Promise<Response> { return login(req); }
