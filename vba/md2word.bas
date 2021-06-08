
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
  ElseIf command = "left" Then
    Selection.MoveLeft Unit:=wdCharacter, Count:=CInt(parameter)
  ElseIf command = "right" Then
    Selection.MoveRight Unit:=wdCharacter, Count:=CInt(parameter)
  ElseIf command = "enter" Then
    Selection.TypeParagraph
  ElseIf command = "select" Then
    Selection.MoveRight Unit:=wdCharacter, Count:=CInt(parameter), Extend:=wdExtend
  ElseIf command = "format" Then

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
