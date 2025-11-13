import React, { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import EncargadosManager from './EncargadosManager'
import { 
  Building2, 
  MapPin, 
  Package, 
  Calendar, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle2,
  Hospital,
  MapPinned,
  Hash
} from 'lucide-react'

// Mover InputField y OptionalInputField fuera del componente para evitar que
// se re-creen en cada render y provoquen remounts (pérdida de foco).
  const InputField = React.memo(({ label, name, placeholder, icon: Icon, type = "text", error, touched, value, onChange, onFocus, onBlur, disabled, ...props }) => (
  <div className="relative">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
      <span className="text-red-500 ml-1">*</span>
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`${error && touched ? 'text-red-400' : 'text-gray-400'} transition-colors`} size={18} />
        </div>
      )}
      <input
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl transition-all duration-200
          ${error && touched
            ? 'border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50'
            : 'border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white'
          }
        `}
        {...props}
      />
      {error && touched && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <AlertCircle className="text-red-500" size={18} />
        </div>
      )}
    </div>
    {error && touched && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertCircle size={14} />
        {error}
      </p>
    )}
  </div>
))

const OptionalInputField = React.memo(({ label, name, placeholder, icon: Icon, type = "text", hint, value, onChange, onFocus, onBlur, ...props }) => (
  <div className="relative">
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
      <span className="text-gray-400 text-xs ml-2">(Opcional)</span>
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="text-gray-400" size={18} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={props.disabled}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all"
        {...props}
      />
    </div>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
))

export default function ClientForm({ initial = {}, onSave, onCancel }) {
  // Inicializar el formulario UNA SOLA VEZ con los datos iniciales
  const [form, setForm] = useState(() => {
    // Asegurar que encargados sea un array
    const initialData = { ...initial }
    if (!initialData.encargados) {
      initialData.encargados = []
    }
    return initialData
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const focusedRef = useRef(null)

  const { user } = useAuth()
  const isSeller = user && user.role === 'vendedor'
  const isEditMode = Boolean(initial && (initial.id || initial.apiClientId))

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  function handleBlur(key) {
    setTouched(prev => ({ ...prev, [key]: true }))
  }

  function handleFocus(key) {
    focusedRef.current = key
  }

  function validateForm() {
    const e = {}
    // Si el usuario es vendedor y estamos editando un cliente, solo validar encargados
    if (isSeller && isEditMode) {
      if (!form.encargados || form.encargados.filter(x=>x && x.nombre).length === 0) e.encargados = 'Se requiere al menos un encargado'
      const isValid = Object.keys(e).length === 0
      setErrors(e)
      return { isValid, errors: e }
    }

    const req = ['empresaResponsable','dependencia','hospital','estado','ciudad','codigoPostal','direccion','equipo','marca','modelo','numeroSerie']
    req.forEach(k => { if (!form[k]) e[k] = 'Campo requerido' })
    if (form.codigoPostal && !/^[0-9]{5}$/.test(form.codigoPostal)) e.codigoPostal = 'Código postal debe tener 5 dígitos'
    if (!form.encargados || form.encargados.filter(x=>x && x.nombre).length === 0) e.encargados = 'Se requiere al menos un encargado'
    const isValid = Object.keys(e).length === 0
    setErrors(e)
    return { isValid, errors: e }
  }

  async function submit(e) {
    e && e.preventDefault()
    setIsSubmitting(true)
    
    console.log('[ClientForm] submit - form data:', form)
    console.log('[ClientForm] submit - encargados:', form.encargados)
    
    // Marcar todos los campos como tocados para mostrar errores
    const allFields = ['empresaResponsable','dependencia','hospital','estado','ciudad','codigoPostal','direccion','equipo','marca','modelo','numeroSerie']
    const newTouched = {}
    allFields.forEach(field => newTouched[field] = true)
    setTouched(newTouched)
    
    const { isValid } = validateForm()
    if (!isValid) {
      setIsSubmitting(false)
      return
    }
    
    try {
      // Si el usuario es vendedor y está editando, solo enviar los encargados
      if (isSeller && isEditMode) {
        const payload = { encargados: form.encargados }
        onSave && await onSave(payload)
      } else {
        onSave && await onSave(form)
      }
    } catch (error) {
      console.error('Error al guardar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  

  return (
    <form onSubmit={submit} className="space-y-8">
      
      {/* Sección: Información General */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-100">
          <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
            <Building2 className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Información General</h3>
            <p className="text-sm text-gray-600">Datos básicos del cliente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Empresa Responsable"
            name="empresaResponsable"
            placeholder="Ej: Grupo Médico SA"
            icon={Building2}
            error={errors.empresaResponsable}
            touched={!!touched.empresaResponsable}
            value={form.empresaResponsable || ''}
            onChange={e => handleChange('empresaResponsable', e.target.value)}
            onFocus={() => handleFocus('empresaResponsable')}
            onBlur={() => handleBlur('empresaResponsable')}
          />
          <InputField
            label="Dependencia"
            name="dependencia"
            placeholder="Ej: Secretaría de Salud"
            icon={Building2}
            error={errors.dependencia}
            touched={!!touched.dependencia}
            value={form.dependencia || ''}
            onChange={e => handleChange('dependencia', e.target.value)}
            onFocus={() => handleFocus('dependencia')}
            onBlur={() => handleBlur('dependencia')}
          />
          <InputField
            label="Hospital"
            name="hospital"
            placeholder="Ej: Hospital General"
            icon={Hospital}
            error={errors.hospital}
            touched={!!touched.hospital}
            value={form.hospital || ''}
            onChange={e => handleChange('hospital', e.target.value)}
            onFocus={() => handleFocus('hospital')}
            onBlur={() => handleBlur('hospital')}
          />
        </div>
      </div>

      {/* Sección: Ubicación */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-emerald-100">
          <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
            <MapPin className="text-emerald-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Ubicación</h3>
            <p className="text-sm text-gray-600">Dirección y localización</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Estado"
            name="estado"
            placeholder="Ej: Ciudad de México"
            icon={MapPinned}
            error={errors.estado}
            touched={!!touched.estado}
            value={form.estado || ''}
            onChange={e => handleChange('estado', e.target.value)}
            onFocus={() => handleFocus('estado')}
            onBlur={() => handleBlur('estado')}
          />
          <InputField
            label="Ciudad"
            name="ciudad"
            placeholder="Ej: Benito Juárez"
            icon={MapPin}
            error={errors.ciudad}
            touched={!!touched.ciudad}
            value={form.ciudad || ''}
            onChange={e => handleChange('ciudad', e.target.value)}
            onFocus={() => handleFocus('ciudad')}
            onBlur={() => handleBlur('ciudad')}
          />
          <InputField
            label="Código Postal"
            name="codigoPostal"
            placeholder="Ej: 03100"
            icon={Hash}
            error={errors.codigoPostal}
            touched={!!touched.codigoPostal}
            value={form.codigoPostal || ''}
            onChange={e => handleChange('codigoPostal', e.target.value)}
            onFocus={() => handleFocus('codigoPostal')}
            onBlur={() => handleBlur('codigoPostal')}
            maxLength={5}
          />
          <InputField
            label="Dirección"
            name="direccion"
            placeholder="Calle y número"
            icon={MapPin}
            error={errors.direccion}
            touched={!!touched.direccion}
            value={form.direccion || ''}
            onChange={e => handleChange('direccion', e.target.value)}
            onFocus={() => handleFocus('direccion')}
            onBlur={() => handleBlur('direccion')}
          />
        </div>
      </div>

      {/* Sección: Equipo */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-100">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            <Package className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Información del Equipo</h3>
            <p className="text-sm text-gray-600">Detalles técnicos del equipo biomédico</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Equipo"
            name="equipo"
            placeholder="Ej: Ventilador Mecánico"
            icon={Package}
            error={errors.equipo}
            touched={!!touched.equipo}
            value={form.equipo || ''}
            onChange={e => handleChange('equipo', e.target.value)}
            onFocus={() => handleFocus('equipo')}
            onBlur={() => handleBlur('equipo')}
          />
          <InputField
            label="Marca"
            name="marca"
            placeholder="Ej: Philips"
            error={errors.marca}
            touched={!!touched.marca}
            value={form.marca || ''}
            onChange={e => handleChange('marca', e.target.value)}
            onFocus={() => handleFocus('marca')}
            onBlur={() => handleBlur('marca')}
          />
          <InputField
            label="Modelo"
            name="modelo"
            placeholder="Ej: V60 Plus"
            error={errors.modelo}
            touched={!!touched.modelo}
            value={form.modelo || ''}
            onChange={e => handleChange('modelo', e.target.value)}
            onFocus={() => handleFocus('modelo')}
            onBlur={() => handleBlur('modelo')}
          />
          <InputField
            label="Número de Serie"
            name="numeroSerie"
            placeholder="Ej: SN123456789"
            error={errors.numeroSerie}
            touched={!!touched.numeroSerie}
            value={form.numeroSerie || ''}
            onChange={e => handleChange('numeroSerie', e.target.value)}
            onFocus={() => handleFocus('numeroSerie')}
            onBlur={() => handleBlur('numeroSerie')}
          />
        </div>
      </div>

      {/* Sección: Fechas */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-amber-100">
          <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg">
            <Calendar className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Fechas Importantes</h3>
            <p className="text-sm text-gray-600">Instalación y mantenimiento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OptionalInputField
            label="Fecha de Instalación"
            name="fechaInstalacion"
            placeholder="AAAA-MM-DD"
            icon={Calendar}
            type="date"
            value={form.fechaInstalacion || ''}
            onChange={e => handleChange('fechaInstalacion', e.target.value)}
            onFocus={() => handleFocus('fechaInstalacion')}
            onBlur={() => handleBlur('fechaInstalacion')}
          />
          <OptionalInputField
            label="Último Mantenimiento"
            name="ultimoMantenimiento"
            placeholder="AAAA-MM-DD"
            icon={Calendar}
            type="date"
            value={form.ultimoMantenimiento || ''}
            onChange={e => handleChange('ultimoMantenimiento', e.target.value)}
            onFocus={() => handleFocus('ultimoMantenimiento')}
            onBlur={() => handleBlur('ultimoMantenimiento')}
          />
        </div>
      </div>

      {/* Sección: Encargados */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-cyan-100">
          <div className="p-2 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg">
            <Building2 className="text-cyan-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Encargados</h3>
            <p className="text-sm text-gray-600">Personas de contacto</p>
          </div>
        </div>

        <div className={`p-4 rounded-xl transition-all ${errors.encargados ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-50 border-2 border-gray-200'}`}>
          <EncargadosManager 
            value={form.encargados||[]} 
            onChange={(list) => {
              console.log('[ClientForm] onChange encargados:', list)
              setForm(prev => {
                const updated = { ...prev, encargados: list }
                console.log('[ClientForm] form updated:', updated)
                return updated
              })
              if (errors.encargados) {
                setErrors(prev => {
                  const newErrors = { ...prev }
                  delete newErrors.encargados
                  return newErrors
                })
              }
            }} 
          />
        </div>
        
        {errors.encargados && (
          <div className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle size={16} />
            <span>{errors.encargados}</span>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-gray-200">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={20} />
          <span>Cancelar</span>
        </button>
        
        <button 
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>{isSeller && isEditMode ? 'Guardar Encargados' : 'Guardar Cliente'}</span>
            </>
          )}
        </button>
      </div>

      {/* Indicador de progreso */}
      {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <div className="flex items-center gap-2 text-amber-700 text-sm font-medium bg-amber-50 p-4 rounded-lg border border-amber-200">
          <AlertCircle size={18} />
          <span>Por favor completa todos los campos requeridos antes de guardar</span>
        </div>
      )}
    </form>
  )
}