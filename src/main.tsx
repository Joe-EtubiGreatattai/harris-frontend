import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import './index.css'
import App from './App.tsx'
import clarity from '@microsoft/clarity'

const CLARITY_ID = "unc0mhfl0u"
clarity.init(CLARITY_ID)

import { AnimatePresence } from 'framer-motion'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <AnimatePresence mode="wait">
        <App />
      </AnimatePresence>
    </ChakraProvider>
  </StrictMode>,
)
