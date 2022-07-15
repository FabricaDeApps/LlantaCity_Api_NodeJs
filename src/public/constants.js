
module.exports = Object.freeze({
  //SEVERITY
  CONFLICT: 'CONFLICT',
  CREATED: 'CREATED',
  SUCCESS: 'SUCCESS',
  UNAUTHORIZED: 'UNAUTHORIZED',

  //COMMON MESSAGES
  EMPTY_LIST: 'No hay registros disponibles.',
  CHANGE_STATUS: 'El estatus ha sido actualizado con éxito.',
  DELETE_MSG: 'El registro ha sido eliminado con éxito.',
  SAVE_MSG: 'El registro se ha guardado correctamente.',
  UPDATE_MSG: 'El registro se ha actualizado con éxito.',
  LIST_MSG: 'Los registros se obtuvieron correctamente.',
  MSG_GET: 'El registro se ha obtenido con éxito.',

  //PRODUCTS BACTH
  BATCH_PRODUCT: 'Registros actualizados en WooCommerce',
  PER_PAGE: 50,

  //PRODUCTS EXCEL UPLOAD
  TIRES_EXCEL_LOAD: 'Se cargo exitosamente los registros del Excel en Mysql.',
  EXCEL_FILES: '/files/excel/',
  EXTENSION_NOT_MATCH: "La extensión del archivo no es valida.",
  NOT_EXCEL_FILES: "El archivo excel es requerido.",
  EXCEL_NOT_UPLOAD: "No fue posible leer el archivo por estas razones: ",

  //USER
  USER_DUPLICATE: 'El usuario ya se encuentra registrado.',
  USER_PASSWORD: 'Se cambio exitosamente la contraseña.',
  USER_NOT_GET: "Usuario o contraseña incorrecta.",
  USER_NOT_EXIST: "El usuario no es valido.",
  USER_LOGIN: "Sesión Iniciada.",
  USER_NOT_ACTIVE: "El usuario no se encuentra activo, contacta al administrador.",


  //TIRES
  TIRE_NOT_EXIST: "El poducto no es valido.",
  FAVORITE_UPDATE_MSG: 'Se actualizarón los favoritos.',

  //URLS
  URL_WOOCOMMERCE: 'https://llantacity.mx/',
  URL_IMAGE_WOOCOMERCE: 'https://llantacity.mx/admin/uploads/tires/',

  //KEYS_WOOCOMMERCE
  consumer_key: 'ck_2aff7f6c3d548b93ee2a1611e097432fe863c3ba',
  consumer_secret: 'cs_df1ed41d68bc304a71db467a883fc92110395791',

  //ERROR
  SERVER_ERROR: 'Ocurrio un error en el servidor.',
});