
Private Sub dispatch(instruction)
  Dim commandSep As Integer
  commandSep = InStr(instruction, " ")
  Dim command As String
  Dim parameter As String
  If commandSep <> 0 Then
    command = Left(instruction, commandSep - 1)
    parameter = Mid(instruction, commandSep + 1)
  Else
    command = instruction
    parameter = ""
  End If

  If command = "text" Then
    Selection.TypeText text:=parameter
  ' ElseIf command = "paragraph" Then
  '  Selection.TypeParagraph
  'ElseIf command = "style" Then
  '  Call renderer.style(parameter)
  ' ElseIf command = "begin-paragraph" Then
  '  renderer.beginParagraph
  ' ElseIf command = "end-paragraph" Then
  '  renderer.endParagraph
  ' ElseIf command = "style" Then
  '  Call renderer.text(style)

  End If

End Sub


Sub md2word()
  Dim request As Object
  Set request = CreateObject("MSXML2.XMLHTTP")
  request.Open "GET", "http://localhost:53475/script", False
  request.Send
  Dim commands
  commands = Split(request.ResponseText, vbLf)
  Dim command
  For Each command In commands
    Call dispatch(command)
  Next command
End Sub
