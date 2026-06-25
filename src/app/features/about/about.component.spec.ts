import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';
import { I18nService } from '../../core/services/i18n.service';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [I18nService]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse markdown correctly', () => {
    const text = 'This is **bold** text';
    const parsed = component.parseMarkdown(text);
    expect(parsed).toBe('This is <strong>bold</strong> text');
  });

  it('should handle empty markdown string', () => {
    const parsed = component.parseMarkdown('');
    expect(parsed).toBe('');
  });
});
