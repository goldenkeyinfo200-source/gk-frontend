import { useEffect, useState } from 'react'
import { ArrowLeftRight, Send, CheckCircle, XCircle, Clock } from 'lucide-react'
import { leadsApi, clientsApi } from '../../services/api'
import { Btn, Empty, Spinner, Badge, Modal, Select, Textarea } from '../../components/ui'
import { fmt, TYPE_UZ, NEED_UZ, fmtTime } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_COLOR = {
  pending: 'amber',
  accepted: 'green',
  rejected: 'red',
  closed: 'gray',
}

const STATUS_UZ = {
  pending: 'Kutmoqda',
  accepted: 'Qabul qilindi',
  rejected: 'Rad etildi',
  closed: 'Yopildi',
}

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('incoming')
  const [sendOpen, setSendOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await leadsApi.list({ type })
      setLeads(data)
    } catch {
      toast.error('Lidlarni yuklashda xato')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [type])

  const respond = async (id, action) => {
    try {
      await leadsApi.respond(id, action)
      toast.success(action === 'accept' ? 'Qabul qilindi!' : 'Rad etildi')
      load()
    } catch {
      toast.error('Xato')
    }
  }

  const pending = leads.filter(l => l.status === 'pending')
  const accepted = leads.filter(l => l.status === 'accepted')
  const rejected = leads.filter(l => l.status === 'rejected')

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lidlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leads.length} ta lid</p>
        </div>

        <Btn onClick={() => setSendOpen(true)}>
          <Send size={16} /> Lid yuborish
        </Btn>
      </div>

      <div className="flex gap-1 bg-white border border-cherry-100 rounded-2xl p-1">
        {[
          { key: 'incoming', label: 'Kelgan lidlar' },
          { key: 'outgoing', label: 'Yuborilgan' },
          { key: '', label: 'Barchasi' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={clsx(
              'flex-1 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all',
              type === t.key
                ? 'bg-cherry-700 text-white'
                : 'text-gray-500 hover:text-cherry-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-amber-600">{pending.length}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <Clock size={11} /> Kutmoqda
            </div>
          </div>

          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-green-600">{accepted.length}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <CheckCircle size={11} /> Qabul
            </div>
          </div>

          <div className="card p-3 text-center">
            <div className="text-xl font-bold text-cherry-600">{rejected.length}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <XCircle size={11} /> Rad
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : leads.length === 0 ? (
        <Empty
          icon={ArrowLeftRight}
          title="Lidlar yo'q"
          desc={type === 'incoming' ? 'Hali sizga lid yuborilmagan' : 'Siz hali lid yubormagansiz'}
        />
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <div>
              <p className="section-title flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" />
                Javob kutayotgan ({pending.length})
              </p>

              <div className="space-y-3">
                {pending.map(l => (
                  <LeadCard key={l.id} lead={l} type={type} onRespond={respond} />
                ))}
              </div>
            </div>
          )}

          {[...accepted, ...rejected].length > 0 && (
            <div>
              <p className="section-title">Yakunlangan</p>

              <div className="space-y-3">
                {[...accepted, ...rejected].map(l => (
                  <LeadCard key={l.id} lead={l} type={type} onRespond={respond} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <SendLeadModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSent={() => {
          setSendOpen(false)
          load()
        }}
      />
    </div>
  )
}

function LeadCard({ lead: l, type, onRespond }) {
  const isIncoming = type === 'incoming'
  const isOutgoing = type === 'outgoing'

  const personName = isIncoming ? l.sender_name : l.receiver_name

  return (
    <div className={clsx('card p-4', l.status === 'pending' && 'border-amber-200')}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-cherry-100 flex items-center justify-center text-xs font-semibold text-cherry-700 flex-shrink-0">
          {personName?.[0] || 'A'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-gray-900">
              {personName || 'Agent'}
            </span>

            <span className="text-xs text-gray-400">
              {l.display_id}
            </span>

            <Badge color={STATUS_COLOR[l.status]}>
              {STATUS_UZ[l.status]}
            </Badge>
          </div>

          <p className="text-xs text-gray-600">
            {l.client_name} · {TYPE_UZ[l.property_type] || l.property_type} · {NEED_UZ[l.need_type] || l.need_type}
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            Byudjet: {fmt(l.budget_min)} — {fmt(l.budget_max)}
          </p>

          {isOutgoing && l.client_phone && (
            <a
              href={`tel:${l.client_phone}`}
              className="text-xs text-cherry-600 hover:underline flex items-center gap-1 mt-1"
            >
              📞 {l.client_phone}
            </a>
          )}

          {isIncoming && (
            <p className="text-xs text-gray-400 mt-1">
              📞 Mijoz raqami qabul qilgandan keyin ochiladi
            </p>
          )}

          {l.notes && (
            <p className="text-xs text-gray-500 bg-cherry-50 rounded-lg px-2.5 py-1.5 mt-2">
              💬 {l.notes}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-400">{fmtTime(l.created_at)}</p>
        </div>
      </div>

      {isIncoming && l.status === 'pending' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-cherry-50">
          <Btn
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onRespond(l.id, 'accept')}
          >
            <CheckCircle size={13} /> Qabul qilish
          </Btn>

          <Btn
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onRespond(l.id, 'reject')}
          >
            <XCircle size={13} /> Rad etish
          </Btn>
        </div>
      )}
    </div>
  )
}

function SendLeadModal({ open, onClose, onSent }) {
  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    client_id: '',
    property_id: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
  }

  useEffect(() => {
    if (open) {
      clientsApi.list({ status: 'active' }).then(r => setClients(r.data))
    }
  }, [open])

  const submit = async e => {
    e.preventDefault()

    if (!form.client_id || !form.property_id) {
      return toast.error("Mijoz va obyekt ID ni kiriting")
    }

    setLoading(true)

    try {
      await leadsApi.send(form)
      toast.success('Lid yuborildi!')
      onSent()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Lid yuborish" size="sm">
      <form onSubmit={submit} className="space-y-4">
        <Select
          label="Mijoz tanlang"
          value={form.client_id}
          onChange={e => set('client_id', e.target.value)}
        >
          <option value="">— Tanlang —</option>

          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.full_name || c.display_id} · {fmt(c.budget_max)}
            </option>
          ))}
        </Select>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Obyekt ID
          </label>

          <input
            value={form.property_id}
            onChange={e => set('property_id', e.target.value)}
            placeholder="Obyekt UUID yoki ID"
            className="w-full border border-cherry-100 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100"
          />

          <p className="text-xs text-gray-400 mt-1">
            Lid obyekt egasiga Telegram orqali boradi
          </p>
        </div>

        <Textarea
          label="Izoh"
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Qo'shimcha ma'lumot..."
        />

        <div className="flex gap-2">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">
            Bekor
          </Btn>

          <Btn type="submit" loading={loading} className="flex-1">
            <Send size={14} /> Yuborish
          </Btn>
        </div>
      </form>
    </Modal>
  )
}