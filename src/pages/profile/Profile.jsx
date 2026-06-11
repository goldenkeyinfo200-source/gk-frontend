import { useState } from 'react'
import { Lock, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import { Btn, Input } from '../../components/ui'
import toast from 'react-hot-toast'

export default function Profile() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [loading, setLoading] = useState(false)

  const set = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return toast.error('Барча майдонларни тўлдиринг')
    }

    if (form.newPassword.length < 4) {
      return toast.error('Янги пароль камида 4 та белгидан иборат бўлсин')
    }

    if (form.newPassword !== form.confirmPassword) {
      return toast.error('Янги парольлар мос эмас')
    }

    setLoading(true)

    try {
      await api.put('/api/auth/change-password', form)

      toast.success('Пароль муваффақиятли ўзгартирилди')

      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Хатолик')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Lock size={20} className="text-cherry-700" />
          Profil
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Паролингизни хавфсиз тарзда ўзгартиринг
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">
          Паролни ўзгартириш
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Ҳозирги пароль"
            type="password"
            value={form.currentPassword}
            onChange={e => set('currentPassword', e.target.value)}
            placeholder="Ҳозирги пароль"
          />

          <Input
            label="Янги пароль"
            type="password"
            value={form.newPassword}
            onChange={e => set('newPassword', e.target.value)}
            placeholder="Янги пароль"
          />

          <Input
            label="Янги парольни қайта киритинг"
            type="password"
            value={form.confirmPassword}
            onChange={e => set('confirmPassword', e.target.value)}
            placeholder="Янги парольни қайта киритинг"
          />

          <Btn type="submit" loading={loading} className="w-full">
            <CheckCircle size={14} />
            Сақлаш
          </Btn>
        </form>
      </div>
    </div>
  )
}