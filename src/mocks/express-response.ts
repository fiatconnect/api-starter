import express from 'express'

export function getMockResponse(): Partial<express.Response> {
  const res: Partial<express.Response> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}
