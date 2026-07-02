import { create } from "zustand";

import {

MostrarTransferencias,
InsertarTransferencia,
EliminarTransferencia,
EnviarTransferencia,
RecibirTransferencia

}
from "../index";

const tabla =
"transferencia_almacen";

export const
useTransferenciasStore=
create(

(set,get)=>({

refetchs:null,

dataTransferencias:[],

transferenciaItemSelect:null,

parametros:{},

mostrarTransferencias:
async(p={})=>{

const response=
await MostrarTransferencias(
p
);

set({

dataTransferencias:
response,

parametros:
p,

refetchs:
p.refetchs

});

if(
response?.length
){

set({

transferenciaItemSelect:
response[0]

});

}

return response;

},

selectTransferencia:
(p)=>{

set({

transferenciaItemSelect:
p

});

},

resetTransferenciaItemSelect:
()=>{

set({

transferenciaItemSelect:
null

});

},

insertarTransferencia:
async(p)=>{

const response=
await InsertarTransferencia(
p
);

const{
mostrarTransferencias
}=get();

const{
parametros
}=get();

await mostrarTransferencias(
parametros
);

return response;

},

eliminarTransferencia:
async(p)=>{

await EliminarTransferencia(
p
);

const{
mostrarTransferencias
}=get();

const{
parametros
}=get();

await mostrarTransferencias(
parametros
);

},

enviarTransferencia:
async(p)=>{

await EnviarTransferencia(
p
);

const{
mostrarTransferencias
}=get();

const{
parametros
}=get();

await mostrarTransferencias(
parametros
);

},

recibirTransferencia:
async(p)=>{

await RecibirTransferencia(
p
);

const{
mostrarTransferencias
}=get();

const{
parametros
}=get();

await mostrarTransferencias(
parametros
);

}

})

);