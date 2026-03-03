require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestCustomer() {
    const email = 'cliente@autocar.com';
    const password = 'autocar123';

    console.log('Criando usuário no Supabase Auth...');

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
    });

    if (authError) {
        if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
            console.log('Usuário já existe, vamos tentar criar os dados de perfil se faltar.');
        } else {
            console.error('Erro fatal ao criar usuário:', authError);
            process.exit(1);
        }
    }

    console.log('Tentando buscar ID do usuário existente...');
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData.users.find(u => u.email === email);

    if (user) {
        await insertCustomerRecord(user.id, email);
    } else {
        console.error("Usuário não encontrado!");
    }
}

async function insertCustomerRecord(id, email) {
    console.log('Inserindo registro na tabela customers para o auth id:', id);

    const { data, error } = await supabase
        .from('customers')
        .upsert({
            id: id,
            full_name: 'João Cliente Mock',
            email: email,
            phone: '5511988887777'
        }, { onConflict: 'id' })
        .select()

    if (error) {
        console.error('Erro ao inserir cliente:', error.message);
    } else {
        console.log('✅ Cliente configurado com sucesso!');
        console.log('=============================')
        console.log('URL LOGiN: /conta/login');
        console.log('E-mail:', email);
        console.log('Senha:', 'autocar123');
        console.log('=============================')
    }
}

createTestCustomer();
