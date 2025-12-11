"use client"

import { useState } from "react"

interface Props {
  data: any
  indent?: number
}

export default function JSONViewer({ data, indent = 0 }: Props) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({})

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const renderValue = (value: any, key: string): JSX.Element => {
    if (value === null) {
      return <span className="text-gray-600">null</span>
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-600">{value.toString()}</span>
    }

    if (typeof value === "number") {
      return <span className="text-blue-600">{value}</span>
    }

    if (typeof value === "string") {
      return <span className="text-green-600">"{value}"</span>
    }

    if (Array.isArray(value)) {
      const isExpanded = expanded[key]
      return (
        <div>
          <button onClick={() => toggleExpand(key)} className="text-lavender-600 hover:underline">
            {isExpanded ? "▼" : "▶"} Array[{value.length}]
          </button>
          {isExpanded && (
            <div className="ml-4 mt-2">
              {value.map((item, idx) => (
                <div key={idx}>
                  <span className="text-gray-500">{idx}:</span> {renderValue(item, `${key}[${idx}]`)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object") {
      const isExpanded = expanded[key]
      return (
        <div>
          <button onClick={() => toggleExpand(key)} className="text-lavender-600 hover:underline">
            {isExpanded ? "▼" : "▶"} Object
          </button>
          {isExpanded && (
            <div className="ml-4 mt-2">
              {Object.entries(value).map(([k, v]) => (
                <div key={k}>
                  <span className="text-orange-600">"{k}":</span> {renderValue(v, `${key}.${k}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return <span>{JSON.stringify(value)}</span>
  }

  return (
    <div className="font-mono text-sm">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="mb-2">
          <span className="text-orange-600">"{key}":</span> {renderValue(value, key)}
        </div>
      ))}
    </div>
  )
}
