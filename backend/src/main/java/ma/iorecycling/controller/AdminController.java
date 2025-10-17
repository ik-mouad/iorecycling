package ma.iorecycling.controller;

import jakarta.validation.Valid;
import ma.iorecycling.dto.ClientDto;
import ma.iorecycling.entity.Client;
import ma.iorecycling.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private ClientRepository clientRepository;
    
    @GetMapping("/clients")
    public List<ClientDto> getAllClients() {
        return clientRepository.findAll().stream()
            .map(client -> new ClientDto(client.getId(), client.getName(), client.getCode()))
            .collect(Collectors.toList());
    }
    
    @GetMapping("/clients/{id}")
    public ResponseEntity<ClientDto> getClient(@PathVariable Long id) {
        Optional<Client> client = clientRepository.findById(id);
        if (client.isPresent()) {
            Client c = client.get();
            return ResponseEntity.ok(new ClientDto(c.getId(), c.getName(), c.getCode()));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/clients")
    public ResponseEntity<ClientDto> createClient(@Valid @RequestBody ClientDto clientDto) {
        // Vérifier que le code n'existe pas déjà
        if (clientRepository.existsByCode(clientDto.getCode())) {
            return ResponseEntity.badRequest().build();
        }
        
        Client client = new Client(clientDto.getName(), clientDto.getCode());
        Client savedClient = clientRepository.save(client);
        
        ClientDto response = new ClientDto(savedClient.getId(), savedClient.getName(), savedClient.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/clients/{id}")
    public ResponseEntity<ClientDto> updateClient(@PathVariable Long id, @Valid @RequestBody ClientDto clientDto) {
        Optional<Client> existingClient = clientRepository.findById(id);
        if (!existingClient.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Client client = existingClient.get();
        
        // Vérifier que le nouveau code n'existe pas déjà (sauf pour le client actuel)
        if (!client.getCode().equals(clientDto.getCode()) && clientRepository.existsByCode(clientDto.getCode())) {
            return ResponseEntity.badRequest().build();
        }
        
        client.setName(clientDto.getName());
        client.setCode(clientDto.getCode());
        
        Client savedClient = clientRepository.save(client);
        ClientDto response = new ClientDto(savedClient.getId(), savedClient.getName(), savedClient.getCode());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/clients/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id) {
        if (!clientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        clientRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
