import { useState } from 'react'

function useDialogState() {
   const [open, setOpen] = useState(false)

   const handleClickOpen = () => {
      setOpen(true)
   }
   const handleClickClose = () => {
      setOpen(false)
   }

   return { open, handleClickOpen, handleClickClose }
}

export default useDialogState
