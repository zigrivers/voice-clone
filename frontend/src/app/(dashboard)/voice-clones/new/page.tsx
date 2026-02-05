/**
 * Create Voice Clone Page
 */

import { VoiceCloneForm } from "@/components/voice-clone/voice-clone-form"

export default function NewVoiceClonePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <VoiceCloneForm mode="create" />
    </div>
  )
}
