import styled from "styled-components";
import {
Btn1,
Title,

RegistrarTransferencia,
useTransferenciasStore
}
from "../../index";
import{TablaTransferencia} from "../organismos/tablas/TablaTransferencia";

import { v } from "../../styles/variables";

import { useState } from "react";

export function TransferenciasTemplate(){

const[
openRegistro,
SetopenRegistro
]=useState(false);

const[
accion,
setAccion
]=useState("");

const[
dataSelect,
setdataSelect
]=useState([]);

const{
data
}
=
useTransferenciasStore();

function nuevoRegistro(){

SetopenRegistro(
!openRegistro
);

setAccion(
"Nuevo"
);

setdataSelect([]);

}

return(

<Container>

{

openRegistro && (

<RegistrarTransferencia

onClose={
()=>SetopenRegistro(false)
}

accion={
accion
}

dataSelect={
dataSelect
}

state={
openRegistro
}

/>

)

}

<section
className="area1"
>

<Title>
Transferencias
</Title>

<Btn1

funcion={
nuevoRegistro
}

bgcolor={
v.colorPrincipal
}

titulo="nuevo"

icono={
<v.iconoagregar/>
}

/>

</section>

<section
className="main"
>

<TablaTransferencia

data={
data
}

setAccion={
setAccion
}

setdataSelect={
setdataSelect
}

SetopenRegistro={
SetopenRegistro
}

/>

</section>

</Container>

);

}

const Container=styled.div`

height:
calc(
100vh - 80px
);

margin-top:
50px;

padding:
15px;

display:
grid;

grid-template:

"area1"
60px

"main"
auto;

.area1{

display:flex;

justify-content:end;

align-items:center;

gap:10px;

}

`;