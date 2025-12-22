export class RegistrarPasaporteUseCaseRequest{
    id_usuario:string;
    tipo_de_pasaporte:string;
    fecha_de_emision:Date;
    fecha_de_vencimiento:Date;
    lugar:string;
    pais_de_emision:number;
    numero_de_pasaporte:string;
    habilitado:boolean;
}