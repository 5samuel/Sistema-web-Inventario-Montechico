import styled from "styled-components";
import {
Btn1,
InputText,
BtnClose,
SelectList,
useTransferenciasStore,
useAlmacenesStore,
useEmpresaStore
}
from "../../../index";

import { v } from "../../../styles/variables";

import { useForm } from "react-hook-form";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

export function RegistrarTransferencia({

onClose,
accion,
state

}){

if(!state)return;

const{

insertarTransferencia

}
=
useTransferenciasStore();

const{

dataalmacen,
almacenSelectItem,
setAlmacenSelectItem

}
=
useAlmacenesStore();

const{

dataempresa

}
=
useEmpresaStore();

const{

register,
handleSubmit

}
=
useForm();

const{

isPending,

mutate

}
=
useMutation({

mutationFn:guardar,

onSuccess:()=>{

toast.success(
"Transferencia creada"
);

onClose();

},

onError:(e)=>{

toast.error(
e.message
);

}

});

function submit(data){

mutate(data);

}

async function guardar(data){

const p={

p_origen:
Number(
data.origen
),

p_destino:
Number(
data.destino
),

p_observacion:
data.observacion,

p_usuario:
1

};

await insertarTransferencia(
p
);

}

return(

<Container>

<div
className="sub-contenedor"
>

<div
className="headers"
>

<h1>

Registrar Transferencia

</h1>

<BtnClose
funcion={onClose}
/>

</div>

<form
className="formulario"

onSubmit={
handleSubmit(
submit
)
}

>

<InputText>

<input

type="number"

placeholder="almacen origen"

{

...register(
"origen",
{
required:true
}
)

}

/>

<label>

Origen

</label>

</InputText>

<InputText>

<input

type="number"

placeholder="almacen destino"

{

...register(
"destino",
{
required:true
}
)

}

/>

<label>

Destino

</label>

</InputText>

<InputText>

<input

type="text"

placeholder="observacion"

{

...register(
"observacion"
)

}

/>

<label>

Observacion

</label>

</InputText>

<Btn1

titulo={
isPending
?
"Guardando..."
:
"Guardar"
}

bgcolor={
v.colorPrincipal
}

icono={
<v.iconoguardar/>
}

/>

</form>

</div>

</Container>

);

}

const Container=
styled.div`

position:fixed;

top:0;

left:0;

width:100%;

height:100%;

display:flex;

align-items:center;

justify-content:center;

background:
rgba(
0,
0,
0,
0.3
);

z-index:1000;

.sub-contenedor{

background:
white;

padding:
30px;

border-radius:
10px;

width:
500px;

}

.headers{

display:flex;

justify-content:
space-between;

margin-bottom:
20px;

}

.formulario{

display:flex;

flex-direction:
column;

gap:
20px;

}

`;