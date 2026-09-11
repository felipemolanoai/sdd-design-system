import { useState } from 'react'
import { Select } from './components/Select'

function App() {
  const [country, setCountry] = useState<string | null>(null)

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '80px auto',
        padding: 24,
      }}
    >
      <Select
        label="Country"
        placeholder="Choose a country"
        value={country}
        onChange={setCountry}
        options={[
          { value: 'co', label: 'Colombia' },
          { value: 'mx', label: 'México' },
          { value: 'ar', label: 'Argentina' },
        ]}
      />
    </main>
  )
}

export default App