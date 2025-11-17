'use client'

import { useState, useEffect } from "react"
import { Question, QuestionType } from "@prisma/client"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

interface QuestionCardProps {
  question: Question & { challengeId: string }
  onAnswer: (answer: string, isCorrect: boolean) => void
  onHint: () => void
  soundEnabled: boolean
}

export function QuestionCard({
  question,
  onAnswer,
  onHint,
  soundEnabled,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const checkAnswer = (answer: string) => {
    const correct = answer.toLowerCase().trim() ===
                   question.correctAnswer.toLowerCase().trim()

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      toast.success("Correct! 🎉")
      if (soundEnabled) playSound('correct')
    } else {
      toast.error("Incorrect. Try again!")
      if (soundEnabled) playSound('incorrect')
    }

    setTimeout(() => {
      onAnswer(answer, correct)
      setShowFeedback(false)
      setSelectedAnswer("")
      setShowHint(false)
    }, 1500)
  }

  const playSound = (type: 'correct' | 'incorrect') => {
    // Placeholder for sound effects
    // You can integrate a sound library like use-sound here
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const renderQuestionContent = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return renderMultipleChoice()
      case QuestionType.TEXT_INPUT:
        return renderTextInput()
      case QuestionType.AUDIO:
        return renderAudioQuestion()
      case QuestionType.IMAGE_SELECT:
        return renderImageSelect()
      case QuestionType.FILL_BLANK:
        return renderFillBlank()
      default:
        return renderTextInput()
    }
  }

  const renderMultipleChoice = () => {
    const options = question.options as string[] || []

    return (
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedAnswer(option)
              checkAnswer(option)
            }}
            disabled={showFeedback}
            className={`
              w-full p-4 text-left rounded-xl border-2 font-medium transition-all
              ${selectedAnswer === option && showFeedback
                ? isCorrect
                  ? 'bg-green-100 border-green-500'
                  : 'bg-red-100 border-red-500'
                : 'bg-white border-gray-300 hover:border-primary-400 hover:bg-primary-50'
              }
              disabled:cursor-not-allowed
            `}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                {String.fromCharCode(65 + index)}
              </div>
              <span>{option}</span>
            </div>
          </motion.button>
        ))}
      </div>
    )
  }

  const renderTextInput = () => {
    const [inputValue, setInputValue] = useState("")

    return (
      <div className="space-y-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              checkAnswer(inputValue)
            }
          }}
          disabled={showFeedback}
          placeholder="Type your answer..."
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:outline-none disabled:bg-gray-100"
          autoFocus
        />
        <button
          onClick={() => checkAnswer(inputValue)}
          disabled={!inputValue.trim() || showFeedback}
          className="btn-primary w-full"
        >
          Submit Answer
        </button>
      </div>
    )
  }

  const renderAudioQuestion = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <button
            onClick={() => speakText(question.correctAnswer)}
            className="mx-auto w-32 h-32 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-6xl transition-all hover:scale-110 active:scale-95"
          >
            🔊
          </button>
          <p className="mt-4 text-gray-600">
            Click to hear the audio
          </p>
        </div>

        {renderTextInput()}
      </div>
    )
  }

  const renderImageSelect = () => {
    const options = question.options as Array<{ imageUrl: string; text: string }> || []

    return (
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedAnswer(option.text)
              checkAnswer(option.text)
            }}
            disabled={showFeedback}
            className={`
              p-4 rounded-xl border-2 transition-all
              ${selectedAnswer === option.text && showFeedback
                ? isCorrect
                  ? 'bg-green-100 border-green-500'
                  : 'bg-red-100 border-red-500'
                : 'bg-white border-gray-300 hover:border-primary-400'
              }
              disabled:cursor-not-allowed
            `}
          >
            {option.imageUrl && (
              <img
                src={option.imageUrl}
                alt={option.text}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
            )}
            <div className="font-medium text-center">{option.text}</div>
          </motion.button>
        ))}
      </div>
    )
  }

  const renderFillBlank = () => {
    const parts = question.prompt.split('___')

    return (
      <div className="space-y-4">
        <div className="text-xl font-medium text-gray-900 bg-white p-6 rounded-xl">
          {parts[0]}
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && selectedAnswer.trim()) {
                checkAnswer(selectedAnswer)
              }
            }}
            disabled={showFeedback}
            className="mx-2 px-3 py-1 border-b-2 border-primary-500 focus:outline-none inline-block min-w-[200px]"
            placeholder="..."
          />
          {parts[1]}
        </div>
        <button
          onClick={() => checkAnswer(selectedAnswer)}
          disabled={!selectedAnswer.trim() || showFeedback}
          className="btn-primary w-full"
        >
          Submit Answer
        </button>
      </div>
    )
  }

  return (
    <div className="card max-w-2xl mx-auto">
      {/* Question Prompt */}
      <div className="mb-8">
        <div className="text-2xl font-bold text-gray-900 mb-4">
          {question.prompt}
        </div>

        {question.imageUrl && question.type !== QuestionType.IMAGE_SELECT && (
          <img
            src={question.imageUrl}
            alt="Question"
            className="w-full h-64 object-cover rounded-xl mb-4"
          />
        )}

        {question.audioUrl && question.type !== QuestionType.AUDIO && (
          <button
            onClick={() => speakText(question.prompt)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <span className="text-2xl">🔊</span>
            <span>Play audio</span>
          </button>
        )}
      </div>

      {/* Question Content */}
      {renderQuestionContent()}

      {/* Hint */}
      {question.hint && (
        <div className="mt-6">
          {!showHint ? (
            <button
              onClick={() => {
                setShowHint(true)
                onHint()
              }}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2"
            >
              <span>💡</span>
              <span>Show hint</span>
            </button>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <span className="text-xl">💡</span>
                <div>
                  <div className="font-semibold text-yellow-900 mb-1">Hint:</div>
                  <div className="text-yellow-800">{question.hint}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {showFeedback && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-6 p-4 rounded-xl ${
            isCorrect
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start space-x-2">
            <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
            <div>
              <div className={`font-semibold mb-1 ${
                isCorrect ? 'text-green-900' : 'text-red-900'
              }`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
              <div className={isCorrect ? 'text-green-800' : 'text-red-800'}>
                {question.explanation}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
