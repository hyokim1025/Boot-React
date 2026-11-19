package org.zerock.mallapi.service;

import java.util.NoSuchElementException;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.mallapi.domain.Todo;
import org.zerock.mallapi.dto.PageRequestDTO;
import org.zerock.mallapi.dto.PageResponseDTO;
import org.zerock.mallapi.dto.TodoDTO;
import org.zerock.mallapi.repository.TodoRepository;

@Service
@Transactional
@RequiredArgsConstructor
public class TodoServiceImpl implements TodoService {

    private final ModelMapper modelMapper;
    private final TodoRepository todoRepository;

    @Override
    public Long register(TodoDTO todoDTO) {
        todoDTO.setTno(null);
        Todo todo = modelMapper.map(todoDTO, Todo.class);
        return todoRepository.save(todo).getTno();
    }

    @Override
    @Transactional(readOnly = true)
    public TodoDTO get(Long tno) {
        return modelMapper.map(findTodo(tno), TodoDTO.class);
    }

    @Override
    public void modify(TodoDTO todoDTO) {
        Todo todo = findTodo(todoDTO.getTno());
        todo.changeTitle(todoDTO.getTitle());
        todo.changeComplete(todoDTO.isComplete());
        todo.changeDueDate(todoDTO.getDueDate());
    }

    @Override
    public void remove(Long tno) {
        todoRepository.deleteById(tno);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<TodoDTO> list(PageRequestDTO request) {
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(),
                Sort.by("tno").descending());
        Page<TodoDTO> page = todoRepository.findAll(pageable)
                .map(todo -> modelMapper.map(todo, TodoDTO.class));

        return PageResponseDTO.<TodoDTO>withAll()
                .dtoList(page.getContent())
                .pageRequestDTO(request)
                .totalCount(page.getTotalElements())
                .build();
    }

    private Todo findTodo(Long tno) {
        return todoRepository.findById(tno)
                .orElseThrow(() -> new NoSuchElementException("Todo " + tno + " not found"));
    }
}
