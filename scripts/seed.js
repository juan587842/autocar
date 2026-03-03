require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Verifica se os arquivos de env foram carregados, ou se deve pegar de .env
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    require('dotenv').config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Faltam variáveis de ambiente do Supabase (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Iniciando Seeding de Dados Fictícios do Painel AutoCar...');

    // 1. Limpeza Opcional (apenas para testes agressivos em ambiente auth-role, mas vamos manter simples e só injetar)
    // Se fosse necessário: await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('--- 1/6: Criando Veículos (Estoque) ---');
    const { data: vehiclesData, error: vError } = await supabase.from('vehicles').upsert([
        { brand: 'Chevrolet', model: 'Tracker Premier 1.2 Turbo', year_fab: 2022, year_model: 2023, price: 135900, status: 'available', slug: 'tracker-premier-2023' },
        { brand: 'Toyota', model: 'Corolla Cross XRE 2.0', year_fab: 2023, year_model: 2024, price: 168500, status: 'reserved', slug: 'corolla-cross-xre-2024' },
        { brand: 'Jeep', model: 'Compass Longitude T270', year_fab: 2021, year_model: 2022, price: 155000, status: 'sold', slug: 'compass-longitude-2022' },
        { brand: 'Honda', model: 'HR-V Touring 1.5 Turbo', year_fab: 2020, year_model: 2021, price: 145000, status: 'available', slug: 'hr-v-touring-2021' },
        { brand: 'Volkswagen', model: 'Nivus Highline 200 TSI', year_fab: 2021, year_model: 2022, price: 125000, status: 'available', slug: 'nivus-highline-2022' },
        { brand: 'Hyundai', model: 'Creta Ultimate 2.0', year_fab: 2022, year_model: 2022, price: 158900, status: 'available', slug: 'creta-ultimate-2022' },
        { brand: 'Fiat', model: 'Fastback Limited Edition Turbo 270', year_fab: 2023, year_model: 2023, price: 154990, status: 'reserved', slug: 'fastback-limited-2023' }
    ], { onConflict: 'slug' }).select();
    if (vError) console.error('Erro em Veículos:', vError.message);
    else {
        console.log(`✓ Veículos criados (${vehiclesData?.length})`);
        // Adicionando fotos para os veículos
        const photosToInsert = [
            { vehicle_id: vehiclesData[0].id, url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2670&auto=format&fit=crop', is_cover: true },
            { vehicle_id: vehiclesData[1].id, url: 'https://images.unsplash.com/photo-1590362891991-f20bc081e537?q=80&w=2670&auto=format&fit=crop', is_cover: true },
            { vehicle_id: vehiclesData[2].id, url: 'https://images.unsplash.com/photo-1563720225384-9ff05909260d?q=80&w=2670&auto=format&fit=crop', is_cover: true },
            { vehicle_id: vehiclesData[3].id, url: 'https://images.unsplash.com/photo-1502877338593-7fe7da419add?q=80&w=2669&auto=format&fit=crop', is_cover: true },
            { vehicle_id: vehiclesData[4].id, url: 'https://images.unsplash.com/photo-1606016159991-d17e127394e1?q=80&w=2706&auto=format&fit=crop', is_cover: true },
            { vehicle_id: vehiclesData[5].id, url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?q=80&w=2696&auto=format&fit=crop', is_cover: true },
            { vehicle_id: vehiclesData[6].id, url: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?q=80&w=2800&auto=format&fit=crop', is_cover: true }
        ];
        await supabase.from('vehicle_photos').insert(photosToInsert);
    }

    console.log('--- 2/6: Criando Clientes (CRM) ---');
    const { data: userAuth } = await supabase.auth.admin.listUsers(); // Usando bypass admin ou pegando quem já logou
    const mainAgentId = userAuth?.users?.[0]?.id || null;

    const { data: customersData, error: cError } = await supabase.from('customers').insert([
        { full_name: 'Carlos Eduardo da Silva', email: 'carlos.eduardo@teste.com', phone: '5511999998888', source: 'website', assigned_to: mainAgentId },
        { full_name: 'Ana Maria Costa', email: 'ana.costa@teste.com', phone: '5511988887777', source: 'whatsapp', assigned_to: mainAgentId },
        { full_name: 'Roberto Fernandes', email: 'roberto.f@teste.com', phone: '5511977776666', source: 'manual', assigned_to: mainAgentId },
        { full_name: 'Juliana Paes Sousa', email: 'juliana.ps@teste.com', phone: '5511966665555', source: 'referral', assigned_to: mainAgentId }
    ]).select();
    if (cError) console.error('Erro em Clientes:', cError.message);
    else console.log(`✓ Clientes criados (${customersData?.length})`);

    console.log('--- 3/6: Criando Ofertas Formulário Público ---');
    const { data: offersData, error: oError } = await supabase.from('vehicle_offers').insert([
        { name: 'Fernanda Lima', phone: '5511955554444', email: 'fernanda@teste.com', brand: 'Honda', model: 'Civic EXL', year: 2019, mileage: 55000, desired_price: 110000, notes: 'Carro de não fumante, IPVA 2026 pago.', status: 'new', lgpd_consent: true, photo_urls: ['https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2574&auto=format&fit=crop'] },
        { name: 'Marcos Almeida', phone: '5511944443333', email: 'marcos@teste.com', brand: 'Chevrolet', model: 'Onix Plus', year: 2021, mileage: 42000, desired_price: 85000, notes: 'Preciso vender urgente.', status: 'reviewing', lgpd_consent: true, photo_urls: [] }
    ]).select();
    if (oError) console.error('Erro em Ofertas:', oError.message);
    else console.log(`✓ Ofertas criadas (${offersData?.length})`);

    console.log('--- 4/6: Criando Agendamentos ---');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    if (customersData && vehiclesData && mainAgentId) {
        const { data: appointmentsData, error: appError } = await supabase.from('appointments').insert([
            { customer_id: customersData[0].id, vehicle_id: vehiclesData[0].id, seller_id: mainAgentId, scheduled_at: today.toISOString(), duration_min: 45, status: 'confirmed', notes: 'Primeiro contato visual, quer financiar.' },
            { customer_id: customersData[1].id, vehicle_id: vehiclesData[1].id, seller_id: mainAgentId, scheduled_at: tomorrow.toISOString(), duration_min: 30, status: 'scheduled', notes: 'Avaliar usado na troca' },
            { customer_id: customersData[2].id, vehicle_id: vehiclesData[3].id, seller_id: mainAgentId, scheduled_at: dayAfter.toISOString(), duration_min: 60, status: 'scheduled', notes: 'Test drive agendado.' }
        ]).select();
        if (appError) console.error('Erro em Agendamentos:', appError.message);
        else console.log(`✓ Agendamentos criados (${appointmentsData?.length})`);
    } else {
        console.log('⚠️ Agendamentos ignorados pois clientes/veículos/usuários falharam.');
    }

    console.log('--- 5/6: Criando Conversas do WhatsApp (Evolution integration fallback) ---');
    if (customersData) {
        const { data: convData, error: convError } = await supabase.from('conversations').insert([
            { phone: customersData[0].phone, customer_id: customersData[0].id, status: 'open', channel: 'whatsapp' },
            { phone: customersData[1].phone, customer_id: customersData[1].id, status: 'open', channel: 'whatsapp' }
        ]).select();
        if (convError) console.error('Erro em Conversations:', convError.message);
        else {
            console.log(`✓ Conversas criadas (${convData?.length})`);

            // Injetar umas mensagens falsas
            console.log('--- 6/6: Criando Mensagens ---');
            await supabase.from('messages').insert([
                { conversation_id: convData[0].id, external_id: 'FALSO123', content: 'Olá, ainda tem a Tracker?', sender_type: 'customer', is_read: true, content_type: 'text' },
                { conversation_id: convData[0].id, external_id: 'FALSO124', content: 'Olá Carlos! Temos sim. Quer que eu envie fotos dela?', sender_type: 'agent', is_read: true, content_type: 'text' },
                { conversation_id: convData[1].id, external_id: 'FALSO125', content: 'Vi o Honda HR-V no site, aceitam troca?', sender_type: 'customer', is_read: true, content_type: 'text' }
            ]);
            console.log('✓ Mensagens falsas inseridas.');
        }
    }

    console.log('--- 7/7: Criando Negócios (Kanban Vendas) ---');
    if (customersData && vehiclesData && mainAgentId) {
        const { data: salesData, error: sError } = await supabase.from('sales').insert([
            { title: 'Interesse Tracker - Carlos', status: 'novos_leads', customer_id: customersData[0].id, vehicle_id: vehiclesData[0].id, value: 135000 },
            { title: 'Negociação Corolla - Ana', status: 'em_negociacao', customer_id: customersData[1].id, vehicle_id: vehiclesData[1].id, value: 165000 },
            { title: 'Aprovação Compass - Roberto', status: 'aprovacao_credito', customer_id: customersData[2].id, vehicle_id: vehiclesData[2].id, value: 155000 },
            { title: 'Venda Fastback - Juliana', status: 'vendido', customer_id: customersData[3].id, vehicle_id: vehiclesData[6].id, value: 154990 }
        ]).select();

        if (sError) console.error('Erro em Vendas (Sales):', sError.message);
        else console.log(`✓ Negócios criados (${salesData?.length})`);
    }

    console.log('\n✅ Seed finalizado com sucesso! Execute o painel para visualizar os novos dados em todas as views.');
    process.exit(0);
}

main().catch(console.error);
