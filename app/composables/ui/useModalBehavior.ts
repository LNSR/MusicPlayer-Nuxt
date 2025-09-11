export function useModalBehavior(options: {
  showModal: Ref<boolean>
  closeModal: () => void
  success?: Ref<string | null>
  loading?: Ref<boolean>
  autofocusRef?: Ref<HTMLInputElement | null>
  autoCloseDelay?: number
}) {
  const { showModal, closeModal, success, loading, autofocusRef, autoCloseDelay = 1200 } = options

  let closeTimer: ReturnType<typeof setTimeout> | null = null

  function onOverlayClick() {
    if (loading?.value) return
    closeModal()
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (loading?.value) return
      closeModal()
    }
  }

  // Auto-close on success
  watch(success || ref(null), (val) => {
    if (val && showModal.value) {
      closeTimer = setTimeout(() => {
        closeTimer = null
        closeModal()
      }, autoCloseDelay)
    }
  })

  // Focus management
  watch(showModal, (isOpen) => {
    if (isOpen && autofocusRef?.value) {
      nextTick().then(() => autofocusRef.value?.focus())
    }
  })

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    window.removeEventListener('keydown', onKeydown)
  })

  return {
    onOverlayClick,
    onKeydown
  }
}