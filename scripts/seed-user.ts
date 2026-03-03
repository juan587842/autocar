import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Force load the correct .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Precisa da key de service role

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE config variables")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function seedUser() {
    const email = 'juanp82462@gmail.com'
    const password = 'senha123'

    console.log(`Tentando criar user: ${email}...`)

    // 1. Create auth user
    const { data: userAuth, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Juan Paulo' }
    })

    if (authErr && !authErr.message.toLowerCase().includes('already')) {
        console.error("Erro na criação Auth:", authErr)
        process.exit(1)
    }

    // get user ID
    let userId
    if (userAuth?.user) {
        userId = userAuth.user.id
    } else {
        // If exists, fetch it
        const { data: users, error: listErr } = await supabase.auth.admin.listUsers()
        if (users?.users) {
            userId = users.users.find(u => u.email === email)?.id
        }
    }

    if (!userId) {
        console.error("Não conseguiu obter o ID do usuário.")
        process.exit(1)
    }

    // 2. Insert into public.users with 'owner' role
    const { error: dbErr } = await supabase
        .from('users')
        .upsert({ id: userId, role: 'owner', full_name: 'Juan Paulo' })

    if (dbErr) {
        console.error("Erro inserindo na tabela public.users:", dbErr)
        process.exit(1)
    }

    console.log(`Usuário ${email} criado e atrelado como Owner com sucesso! ID: ${userId}`)
}

seedUser()
