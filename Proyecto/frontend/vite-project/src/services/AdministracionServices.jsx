const API_URL = import.meta.env.VITE_BACK_END || 'http://localhost:3000/';

export const autenticarUsuario = async (id, contrasenia) => {
  const payload = { id, contrasenia };

  try {
    const res = await fetch(`api/autenticarUsuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('status =>', res.status);      // <--- importante
    const data = await res.json();
    console.log('data =>', data);             // debes ver el JSON como en Postman
    if (!res.ok) throw new Error('Error al autenticar');
    return data;
  } catch (err) {
    console.error('Error en autenticarUsuario:', err);
    throw err;
  }
};

export const registrarUsuario = async (formData) => {
  const payload = {
    correo_electronico: formData.correo_electronico,
    telefono: formData.telefono,
    nombres: formData.nombres,
    apellidos: formData.apellidos,
    sexo: formData.sexo,
    genero: formData.genero,
    pais: Number(formData.pais),
    contrasenia: formData.contrasenia,
    administrador: Boolean(formData.administrador),
    ciudadano: Boolean(formData.ciudadano),
    habilitado: true,
  };

  console.log('payload =>', payload);

  try {
    const res = await fetch(`/api/registroUsuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('status =>', res.status);
    const data = await res.json();
    console.log('data =>', data);
    if (!res.ok) throw new Error('Error al registro');
    return data;
  } catch (err) {
    console.error('Error en registrarUsuario:', err);
    throw err;
  }
};

export const listarPaises = async () => {
  try {
    const res = await fetch(`api/listarPaises`, {
      method: 'GET',
    });


    const data = await res.json();

    if (!res.ok) throw new Error('Error al autenticar');
    return data;
  } catch (err) {
    console.error('Error en autenticarUsuario:', err);
    throw err;
  }
};



export const modificarUsuario = async (formData) => {
  const payload = {
    correo_electronico: formData.correo_electronico,
    telefono: formData.telefono,
    nombres: formData.nombres,
    apellidos: formData.apellidos,
    sexo: formData.sexo,
    genero: formData.genero,
    pais: Number(formData.pais),
    contrasenia: formData.contrasenia,
    administrador: Boolean(formData.administrador),
    ciudadano: Boolean(formData.ciudadano),
    habilitado: true,
  };

  console.log('payload =>', payload);

  try {
    const res = await fetch(`/api/modificarUsuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('status =>', res.status);
    const data = await res.json();
    console.log('data =>', data);
    if (!res.ok) throw new Error('Error al registro');
    return data;
  } catch (err) {
    console.error('Error en registrarUsuario:', err);
    throw err;
  }
};
