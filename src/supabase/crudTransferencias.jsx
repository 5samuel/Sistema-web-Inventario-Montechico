import { supabase } from "../index";

const tabla = "transferencia_almacen";

export async function InsertarTransferencia(p) {

const { data, error } =
await supabase.rpc(
"crear_transferencia",
p
);

if (error) {
throw new Error(
error.message
);
}

return data;

}

export async function MostrarTransferencias() {

const { data, error } =
await supabase
.from(tabla)
.select("*")
.order("id", {
ascending:false
});

if(error){
throw new Error(
error.message
);
}

return data;

}

export async function EnviarTransferencia(p){

const { data,error } =
await supabase.rpc(
"enviar_transferencia",
{
p_transferencia:p.id
}
);

if(error){

throw new Error(
error.message
);

}

return data;

}

export async function RecibirTransferencia(p){

const { data,error } =
await supabase.rpc(
"recibir_transferencia",
{
p_transferencia:p.id
}
);

if(error){

throw new Error(
error.message
);

}

return data;

}

export async function AgregarDetalleTransferencia(p){

const { error } =
await supabase.rpc(
"agregar_detalle_transferencia",
p
);

if(error){

throw new Error(
error.message
);

}

}

export async function EliminarTransferencia(p){

const { error } =
await supabase
.from(tabla)
.delete()
.eq(
"id",
p.id
);

if(error){

throw new Error(
error.message
);

}

}