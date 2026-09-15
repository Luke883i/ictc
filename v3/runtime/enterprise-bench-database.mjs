import pg from 'pg';
import { ENTERPRISE_POSTGRES_DDL } from './postgres-enterprise-authority.mjs';
const { Pool }=pg;
const TABLES=['ictc_tenant_head','ictc_subject_current','ictc_subject_version','ictc_state_bucket','ictc_audit_event','ictc_command_result','ictc_work_item','ictc_blob_object','ictc_telemetry_event'];
const APP_ROLE=/^[a-z_][a-z0-9_]{0,62}$/;
function quoteIdent(value){if(!APP_ROLE.test(String(value)))throw new Error('Invalid PostgreSQL role identifier');return `"${value}"`;}
export async function setupEnterpriseBenchDatabase({adminDatabaseUrl=process.env.ICTC_ENTERPRISE_ADMIN_DATABASE_URL,appRole=process.env.ICTC_ENTERPRISE_APP_ROLE||'ictc_app',appPassword=process.env.ICTC_ENTERPRISE_APP_PASSWORD||'ictc_bench_password',reset=true}={}){
  if(!adminDatabaseUrl)throw Object.assign(new Error('ICTC_ENTERPRISE_ADMIN_DATABASE_URL required'),{code:'enterprise-admin-database-url-required'});
  if(String(appPassword).length<16)throw Object.assign(new Error('Enterprise bench app password must be >=16 chars'),{code:'enterprise-app-password-weak'});
  const role=quoteIdent(appRole),password=String(appPassword).replace(/'/g,"''"),pool=new Pool({connectionString:adminDatabaseUrl,max:2,application_name:'ictc-enterprise-bench-setup'});
  try{
    await pool.query(ENTERPRISE_POSTGRES_DDL);
    const exists=Boolean((await pool.query('SELECT 1 FROM pg_roles WHERE rolname=$1',[appRole])).rowCount);
    if(!exists)await pool.query(`CREATE ROLE ${role} LOGIN`);
    await pool.query(`ALTER ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS PASSWORD '${password}'`);
    await pool.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
    for(const table of TABLES){await pool.query(`REVOKE ALL ON TABLE ${table} FROM PUBLIC`);await pool.query(`GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE ${table} TO ${role}`);}
    if(reset)await pool.query(`TRUNCATE TABLE ${TABLES.join(',')} RESTART IDENTITY`);
    return Object.freeze({schemaVersion:'1.0.0',appRole,tables:Object.freeze([...TABLES]),forceRls:true,reset});
  }finally{await pool.end();}
}
