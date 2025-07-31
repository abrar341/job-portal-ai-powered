import fs from 'fs';
import path from 'path';

export async function GET(_, { params }) {
    const filePath = path.join(process.cwd(), 'public/uploads', params.filename);

    if (!fs.existsSync(filePath)) {
        return new Response('File not found', { status: 404 });
    }

    const file = fs.readFileSync(filePath);
    return new Response(file, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${params.filename}"`,
        },
    });
}
