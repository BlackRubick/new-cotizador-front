import React, { useState } from 'react'
import { 
  UserPlus, 
  Trash2, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { confirmDialog } from '../../utils/swal'

// COMPONENTE MOVIDO FUERA - Esta es la clave para evitar recreación
const InputField = ({ label, value, onChange, placeholder, icon: Icon, error, type = "text", name, onKeyPress }) => (
  <div className="flex-1">
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`${error ? 'text-red-400' : 'text-gray-400'} transition-colors`} size={16} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className={`
          w-full pl-9 pr-3 py-2.5 text-sm rounded-lg transition-all
          ${error
            ? 'border-2 border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50'
            : 'border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white'
          }
        `}
      />
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
        <AlertCircle size={12} />
        {error}
      </p>
    )}
  </div>
)

function EncargadosManager({ value = [], onChange }) {
  const [lista, setLista] = useState(value || [])
  const [nombre, setNombre] = useState('')
  const [cargo, setCargo] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})

  // Sincronizar con el prop value cuando cambie (pero solo al inicio)
  const initializedRef = React.useRef(false)
  React.useEffect(() => {
    if (!initializedRef.current) {
      setLista(value || [])
      initializedRef.current = true
    }
  }, [value])

  function validateFields() {
    const newErrors = {}
    
    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (telefono && !/^[0-9]{10}$/.test(telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'Teléfono debe tener 10 dígitos'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function addEncargado() {
    if (!validateFields()) return
    
    const nuevo = { 
      id: Date.now(), 
      nombre: nombre.trim(), 
      cargo: cargo.trim(), 
      telefono: telefono.trim(), 
      email: email.trim() 
    }
    const next = [nuevo, ...lista]
    setLista(next)
    onChange && onChange(next)
    
    // Limpiar campos
    setNombre('')
    setCargo('')
    setTelefono('')
    setEmail('')
    setErrors({})
  }

  async function removeEncargado(id) {
    if (!(await confirmDialog('¿Eliminar este encargado?'))) return
    const next = lista.filter(x => x.id !== id)
    setLista(next)
    onChange && onChange(next)
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEncargado()
    }
  }

  return (
    <div className="space-y-4">
      {/* Formulario de Agregar */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <UserPlus className="text-blue-600" size={18} />
          </div>
          <h4 className="font-semibold text-gray-800 text-sm">Agregar Encargado</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <InputField
            label="Nombre completo *"
            name="enc_nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Juan Pérez"
            icon={User}
            error={errors.nombre}
            onKeyPress={handleKeyPress}
          />
          <InputField
            label="Cargo"
            name="enc_cargo"
            value={cargo}
            onChange={e => setCargo(e.target.value)}
            placeholder="Ej: Coordinador"
            icon={Briefcase}
            onKeyPress={handleKeyPress}
          />
          <InputField
            label="Teléfono"
            name="enc_telefono"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            placeholder="10 dígitos"
            icon={Phone}
            error={errors.telefono}
            type="tel"
            onKeyPress={handleKeyPress}
          />
          <InputField
            label="Email"
            name="enc_email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            icon={Mail}
            error={errors.email}
            type="email"
            onKeyPress={handleKeyPress}
          />
        </div>

        <button 
          type="button"
          onClick={addEncargado}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
        >
          <UserPlus size={18} />
          <span>Agregar Encargado</span>
        </button>
      </div>

      {/* Lista de Encargados */}
      {lista.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={18} />
              Encargados agregados ({lista.length})
            </h4>
          </div>

          <div className="space-y-2">
            {lista.map((encargado, index) => (
              <div 
                key={encargado.id} 
                className="group bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info Principal */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar con número */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center font-bold text-blue-700">
                      {index + 1}
                    </div>

                    {/* Datos del encargado */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="text-gray-400 flex-shrink-0" size={16} />
                        <h5 className="font-semibold text-gray-800 truncate">
                          {encargado.nombre}
                        </h5>
                      </div>

                      <div className="space-y-1">
                        {encargado.cargo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="text-gray-400 flex-shrink-0" size={14} />
                            <span className="truncate">{encargado.cargo}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {encargado.telefono && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Phone className="text-gray-400 flex-shrink-0" size={14} />
                              <span>{encargado.telefono}</span>
                            </div>
                          )}

                          {encargado.email && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <Mail className="text-gray-400 flex-shrink-0" size={14} />
                              <span className="truncate">{encargado.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón Eliminar */}
                  <button
                    onClick={() => removeEncargado(encargado.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar encargado"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {lista.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3">
            <User className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-600 font-medium">No hay encargados agregados</p>
          <p className="text-gray-500 text-sm mt-1">Agrega al menos un encargado para este cliente</p>
        </div>
      )}
    </div>
  )
}

// Memo para evitar re-renders innecesarios
export default React.memo(EncargadosManager)