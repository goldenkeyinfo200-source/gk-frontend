function PropertyFormModal({ open, property, onClose, onSaved }) {
  const isEdit = !!property

  const [form, setForm] = useState({
    purpose: 'sell', property_type: 'apartment', rooms: '', area: '',
    floor: '', total_floors: '', price: '', city: '', district: '',
    street: '', house_number: '', landmark_note: '', location_url: '',
    owner_name: '', owner_phone: '',
    mortgage: false, installment: false,
    status: 'active',
  })

  const [features, setFeatures] = useState([])
  const [extraNote, setExtraNote] = useState('')
  const [files, setFiles] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [deletedPhotos, setDeletedPhotos] = useState([])
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (property) {
      const parts = (property.address || '').split(',').map(s => s.trim())
      const desc = property.description || ''
      const lines = desc.split('\n')
      const featLine = lines[0] || ''
      const noteLine = lines.slice(1).join('\n').trim()
      const savedFeats = featLine
        ? featLine.split(',').map(s => s.trim()).filter(Boolean)
        : []

      setFeatures(savedFeats)
      setExtraNote(noteLine)
      setFiles([])
      setExistingPhotos(property.photos || [])
      setDeletedPhotos([])

      setForm({
        purpose: property.purpose || 'sell',
        property_type: property.property_type || 'apartment',
        rooms: property.rooms || '',
        area: property.area || '',
        floor: property.floor || '',
        total_floors: property.total_floors || '',
        price: property.price || '',
        city: property.region || '',
        district: property.district || '',
        street: (property.landmark || '').split(' | ')[0] || parts[0] || '',
        landmark_note: (property.landmark || '').split(' | ')[1] || '',
        location_url: property.location_url || '',
        house_number: parts[1] || '',
        owner_name: property.owner_name || '',
        owner_phone: property.owner_phone || '',
        mortgage: property.mortgage || false,
        installment: property.installment || false,
        status: property.status || 'active',
      })
    } else {
      setForm({
        purpose: 'sell', property_type: 'apartment', rooms: '', area: '',
        floor: '', total_floors: '', price: '', city: '', district: '',
        street: '', house_number: '', landmark_note: '', location_url: '',
        owner_name: '', owner_phone: '',
        mortgage: false, installment: false,
        status: 'active',
      })
      setFeatures([])
      setExtraNote('')
      setFiles([])
      setExistingPhotos([])
      setDeletedPhotos([])
    }
  }, [property, open])

  const removeExistingPhoto = (photo) => {
    setDeletedPhotos(prev => [...prev, photo])
    setExistingPhotos(prev => prev.filter(p => p !== photo))
  }

  const removeNewFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!form.price) {
      return toast.error('Narx kiritish shart')
    }

    setLoading(true)

    try {
      const description = [
        features.join(', '),
        extraNote,
      ].filter(Boolean).join('\n')

      const payload = {
        ...form,
        region: form.city,
        landmark: [form.street, form.landmark_note].filter(Boolean).join(' | '),
        address: form.street + (form.house_number ? ', ' + form.house_number : ''),
        location_url: form.location_url || null,
        description,
      }

      const fd = new FormData()

      Object.entries(payload).forEach(([k, v]) => {
        fd.append(k, v ?? '')
      })

      if (isEdit) {
        fd.append('deletedPhotos', JSON.stringify(deletedPhotos))
      }

      files.forEach(f => {
        fd.append('photos', f)
      })

      if (isEdit) {
        await propertiesApi.update(property.id, fd)
        toast.success("Ob'yekt yangilandi!")
      } else {
        await propertiesApi.create(fd)
        toast.success("Ob'yekt qo'shildi va Telegram ga yuborildi!")
      }

      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Xato')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Ob'yektni tahrirlash" : "Yangi ob'yekt"} size="lg">
      <form onSubmit={submit} className="space-y-4">

        <div className="grid grid-cols-2 gap-3">
          <Select label="Maqsad" value={form.purpose} onChange={e => set('purpose', e.target.value)}>
            <option value="sell">Sotiladi</option>
            <option value="rent">Ijaraga</option>
          </Select>

          <Select label="Tur" value={form.property_type} onChange={e => set('property_type', e.target.value)}>
            <option value="apartment">Kvartira</option>
            <option value="house">Uy / Hovli</option>
            <option value="office">Ofis</option>
            <option value="land">Yer</option>
            <option value="commercial">Noturar joy</option>
          </Select>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Input label="Xonalar" type="text" value={form.rooms} onChange={e => set('rooms', e.target.value)} placeholder="2" />
          <Input label="Maydon m²" type="number" value={form.area} onChange={e => set('area', e.target.value)} />
          <Input label="Qavat" type="number" value={form.floor} onChange={e => set('floor', e.target.value)} />
          <Input label="Jami" type="number" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} />
        </div>

        <Input label="Narx ($) *" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000" />

        <div className="bg-cherry-50 rounded-xl p-3 space-y-3">
          <p className="text-xs font-semibold text-cherry-700 flex items-center gap-1.5">
            <MapPin size={13} /> Manzil
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Shahar" value={form.city} onChange={e => set('city', e.target.value)}>
              <option value="">Tanlang</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>

            <Input label="Tuman / Mahalla" value={form.district} onChange={e => set('district', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input label="Ko'cha" value={form.street} onChange={e => set('street', e.target.value)} />
              <p className="text-xs text-green-600 mt-1">✓ E'londa ko'rsatiladi</p>
            </div>

            <div>
              <Input label="Uy raqami" value={form.house_number} onChange={e => set('house_number', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">🔒 Faqat agentga</p>
            </div>
          </div>

          <Input label="Mo'ljal" value={form.landmark_note || ''} onChange={e => set('landmark_note', e.target.value)} />

          <Input label="Lokatsiya" value={form.location_url || ''} onChange={e => set('location_url', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Mulkdor ismi" value={form.owner_name} onChange={e => set('owner_name', e.target.value)} />
          <Input label="Mulkdor telefon" value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} />
        </div>

        {isEdit && (
          <Select label="Holat" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Faol</option>
            <option value="reserved">Band</option>
            <option value="sold">Sotildi</option>
            <option value="archived">Arxivlash</option>
          </Select>
        )}

        <div className="flex gap-6">
          <Toggle checked={form.mortgage} onChange={e => set('mortgage', e.target.checked)} label="Ipoteka" />
          <Toggle checked={form.installment} onChange={e => set('installment', e.target.checked)} label="Muddatli to'lov" />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Xususiyatlar <span className="text-gray-400 font-normal">(tanlang)</span>
          </label>
          <FeatureSelector selected={features} onChange={setFeatures} />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Qo'shimcha izoh <span className="text-gray-400 font-normal">(ixtiyoriy)</span>
          </label>
          <textarea
            rows={2}
            value={extraNote}
            onChange={e => setExtraNote(e.target.value)}
            placeholder="Qo'shimcha ma'lumot..."
            className="w-full bg-white border border-cherry-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:outline-none focus:border-cherry-400 focus:ring-2 focus:ring-cherry-100 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">
            Rasmlar (max 10)
          </label>

          {isEdit && existingPhotos.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {existingPhotos.map((photo, i) => (
                <div key={photo + i} className="relative group">
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-20 rounded-xl object-cover border border-cherry-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(photo)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-sm flex items-center justify-center shadow"
                    title="Rasmni o'chirish"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {isEdit && existingPhotos.length === 0 && (
            <p className="text-xs text-gray-400 mb-2">Mavjud rasm yo'q</p>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setFiles(Array.from(e.target.files || []))}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-cherry-50 file:text-cherry-700 hover:file:bg-cherry-100"
          />

          {files.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    className="w-full h-20 rounded-xl object-cover border border-cherry-100"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-sm flex items-center justify-center shadow"
                    title="Yangi rasmni olib tashlash"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Btn type="button" variant="outline" onClick={onClose} className="flex-1">
            Bekor
          </Btn>

          <Btn type="submit" loading={loading} className="flex-1">
            {isEdit ? <><Edit3 size={14} /> Saqlash</> : <><Send size={14} /> Saqlash va post</>}
          </Btn>
        </div>
      </form>
    </Modal>
  )
}