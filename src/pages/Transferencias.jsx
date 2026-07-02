import { useQuery } from "@tanstack/react-query";

import {
TransferenciasTemplate,
Spinner1,
useTransferenciasStore,
useEmpresaStore
}
from "../index";

export function Transferencias(){

const{

mostrarTransferencias

}
=
useTransferenciasStore();

const{

dataempresa

}
=
useEmpresaStore();

const{

isLoading,
error,
refetch

}
=
useQuery({

queryKey:[
"mostrar transferencias",
dataempresa?.id
],

queryFn:()=>

mostrarTransferencias({

id_empresa:
dataempresa?.id,

refetchs:
refetch

}),

enabled:
!!dataempresa,

refetchOnWindowFocus:
false

});

if(
isLoading
){

return(
<Spinner1/>
);

}

if(
error
){

return(

<span>

Error:

{
error.message
}

</span>

);

}

return(

<TransferenciasTemplate/>

);

}