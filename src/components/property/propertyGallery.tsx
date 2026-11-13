import { useState } from "react"
import { Camera, ChevronLeft, ChevronRight, ImageOff } from "lucide-react"
import { propertyDetailsConstants as D } from "@/common/constants"

interface PropertyGalleryProps {
  images: string[]
  address: string
}

export default function PropertyGallery({ images, address }: PropertyGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [failedUrls, setFailedUrls] = useState<string[]>([])

  const current = images[selected]

  const markFailed = (url: string) =>
    setFailedUrls((previous) => (previous.includes(url) ? previous : [...previous, url]))
  const showPrevious = () => setSelected((index) => (index - 1 + images.length) % images.length)
  const showNext = () => setSelected((index) => (index + 1) % images.length)

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200">
        {current && !failedUrls.includes(current) ? (
          <img
            src={current}
            alt={D.IMAGE_ALT(address, selected + 1)}
            className="h-full w-full object-cover"
            onError={() => markFailed(current)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <span className="text-sm">{D.NO_PHOTOS}</span>
          </div>
        )}

        {images.length > 0 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-slate-900/60 px-2.5 py-1 text-xs text-white">
            <Camera className="h-3 w-3" aria-hidden="true" />
            {D.IMAGE_COUNTER(selected + 1, images.length)}
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label={D.PREVIOUS_PHOTO}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label={D.NEXT_PHOTO}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <li key={`${index}-${url}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={D.THUMBNAIL_LABEL(index + 1)}
                aria-current={index === selected}
                className={`block h-16 w-24 overflow-hidden rounded-lg border-2 bg-slate-200 ${
                  index === selected
                    ? "border-blue-600"
                    : "border-transparent hover:border-slate-300"
                }`}
              >
                {failedUrls.includes(url) ? (
                  <span className="flex h-full w-full items-center justify-center text-slate-400">
                    <ImageOff className="h-5 w-5" aria-hidden="true" />
                  </span>
                ) : (
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => markFailed(url)}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}